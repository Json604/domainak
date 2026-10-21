import { useEffect, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { StoryBrowser, StoryNarration, StorySteps, type StoryTab } from './StoryParts'
import { REGISTRARS, type Phase } from './storyData'
import { API_URL } from '../config'
import type { PromiseResult, Registrar, RegistrarResult } from '../types'

export interface SearchData {
    domain: string
    result: PromiseResult[]
}

// Mirrors SearchEvent in backend/src/types
type ProgressEvent =
    | { type: 'queued' }
    | { type: 'stage', stage: 'launch' | 'open' }
    | { type: 'phase', registrar: Registrar, phase: 'loading' | 'bot' | 'reading' }
    | { type: 'result', result: PromiseResult }

type Stage = 'connecting' | 'queued' | 'launch' | 'open'

const registrarOf = (r: PromiseResult) => r.status === 'fulfilled' ? r.value.registrar : r.reason.registrar

const statusText = (v: RegistrarResult) => typeof v.status === 'string' ? v.status.toLowerCase() : ''

const tabFor = (r: PromiseResult): StoryTab => {
    if (r.status === 'rejected') return { phase: 'failed' }
    const status = statusText(r.value)
    const aftermarket = status.includes('aftermarket')
    if (!(r.value.status === true || status === 'available' || aftermarket)) return { phase: 'taken' }

    const { price } = r.value
    const shown = price === null || price === '' ? null : typeof price === 'number' ? `₹${price}` : price
    return {
        phase: 'done',
        doneLabel: aftermarket ? 'Aftermarket' : 'Available',
        price: shown && <span className="story-price-real">{shown}</span>,
    }
}

const allTabs = (phase: Phase) => Object.fromEntries(REGISTRARS.map((r) => [r.name, { phase }])) as Record<Registrar, StoryTab>

interface LiveStoryProps {
    domain: string
    onDone: (data: SearchData) => void
    onError: (message: string) => void
}

// The story from the demo, driven by the real search as it happens
const LiveStory = ({ domain, onDone, onError }: LiveStoryProps) => {
    const reduceMotion = useReducedMotion()
    const [stage, setStage] = useState<Stage>('connecting')
    const [tabs, setTabs] = useState(() => allTabs('hidden'))
    const [complete, setComplete] = useState(false)
    const [elapsed, setElapsed] = useState(0)

    useEffect(() => {
        if (complete) return
        const id = setInterval(() => setElapsed((s) => s + 1), 1000)
        return () => clearInterval(id)
    }, [complete])

    useEffect(() => {
        const es = new EventSource(`${API_URL}/search/stream?q=${encodeURIComponent(domain)}`)
        let closed = false
        let doneTimer: ReturnType<typeof setTimeout> | undefined
        // Close on every ending, or EventSource reconnects and searches again
        const close = () => { closed = true; es.close() }

        es.addEventListener('progress', (e: MessageEvent<string>) => {
            const event = JSON.parse(e.data) as ProgressEvent
            if (event.type === 'queued') setStage('queued')
            else if (event.type === 'stage') {
                setStage(event.stage)
                if (event.stage === 'open') setTabs(allTabs('loading'))
            }
            else if (event.type === 'phase') setTabs((t) => ({ ...t, [event.registrar]: { phase: event.phase } }))
            else setTabs((t) => ({ ...t, [registrarOf(event.result)]: tabFor(event.result) }))
        })

        es.addEventListener('done', (e: MessageEvent<string>) => {
            close()
            const data = JSON.parse(e.data) as SearchData
            // Cached results arrive with no progress events: fill every tab at once
            setTabs((t) => ({ ...t, ...Object.fromEntries(data.result.map((r) => [registrarOf(r), tabFor(r)])) }))
            setStage('open')
            setComplete(true)
            doneTimer = setTimeout(() => onDone(data), reduceMotion ? 0 : 1200)
        })

        es.addEventListener('failure', (e: MessageEvent<string>) => {
            close()
            onError((JSON.parse(e.data) as { message: string }).message)
        })

        es.onerror = () => {
            if (closed) return
            close()
            onError('Could not reach the Domainak server. Is it still running?')
        }

        return () => {
            close()
            clearTimeout(doneTimer)
        }
    }, [domain, onDone, onError, reduceMotion])

    const phases = Object.values(tabs).map((t) => t.phase)
    const answered = phases.filter((p) => p === 'done' || p === 'taken' || p === 'failed').length
    const bots = phases.filter((p) => p === 'bot').length
    const anyBot = bots > 0
    const opened = stage === 'open'

    const step = complete ? 4
        : answered > 0 || phases.includes('reading') ? 3
        : anyBot ? 2
        : opened ? 1
        : 0

    const narration = complete ? 'All 6 answered. Lining up the prices…'
        : stage === 'connecting' ? 'Starting the search…'
        : stage === 'queued' ? 'Another search is running. You’re next…'
        : stage === 'launch' ? 'Opening a minimized Chrome window. It won’t pop up…'
        : answered > 0 ? `${answered} of 6 registrars answered${bots === 1 ? ', one is still behind a bot check…' : bots > 1 ? `, ${bots} are still behind bot checks…` : '…'}`
        : anyBot ? 'Getting past bot checks, just like a normal visitor…'
        : phases.includes('reading') ? 'Catching each registrar’s own price data as the page loads…'
        : 'Visiting all 6 registrars at the same time…'

    return (
        <div className="story">
            <div className="story-head">
                <h2 style={{ fontWeight: 500 }}>
                    Results for <span style={{ color: '#f5a623' }}>{domain}</span>
                </h2>
                <span className="story-live-pill"><span className="story-live-dot" />LIVE</span>
                <span className="story-elapsed">{elapsed}s</span>
            </div>

            <StorySteps active={step} finished={false} />
            <StoryNarration text={narration} />

            <StoryBrowser
                domain={domain}
                address={opened ? `Chrome (minimized) · 6 tabs · ${domain}` : 'about:blank'}
                tabs={tabs}
            />
        </div>
    )
}

export default LiveStory
