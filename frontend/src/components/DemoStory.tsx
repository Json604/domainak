import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import RegistrarLogo from './RegistrarLogo'
import { Check, HiddenPrice, StoryBrowser, StoryNarration, StorySteps, type StoryTab } from './StoryParts'
import { EASE_OUT, REGISTRARS, type Phase } from './storyData'
import { REPO_URL } from '../config'
import { track } from '../analytics'
import type { Registrar } from '../types'

// Staged replay of what the real backend does. Times are in seconds;
// `done` is when that registrar's price data "arrives".
const TIMELINE: Record<Registrar, { botCheck?: boolean, done: number }> = {
    Godaddy: { botCheck: true, done: 7.4 },
    Namecheap: { done: 3.8 },
    Porkbun: { done: 5.8 },
    Dynadot: { done: 4.6 },
    Hostinger: { botCheck: true, done: 6.8 },
    Spaceship: { done: 5.2 },
}

const STEPS = [
    { at: 0, text: 'Opening a real Chrome browser…' },
    { at: 1.2, text: 'Visiting all 6 registrars at the same time…' },
    { at: 2.6, text: 'Getting past bot checks, just like a normal visitor…' },
    { at: 3.6, text: 'Catching each registrar’s own price data as the page loads…' },
    { at: 8.2, text: 'Lining up every price to find the cheapest…' },
]
const TABS_AT = 1.2
const BOT_AT = 2.6
const COMPARE_AT = 8.2
const END_AT = 9.8

const COMMAND = `git clone ${REPO_URL} && cd domainak && npm start`

const phaseAt = (name: Registrar, i: number, t: number): Phase => {
    const { botCheck, done } = TIMELINE[name]
    if (t < TABS_AT + i * 0.18) return 'hidden'
    if (t >= done) return 'done'
    if (t >= done - 0.9) return 'reading'
    if (botCheck && t >= BOT_AT) return 'bot'
    return 'loading'
}

const DemoStory = ({ domain }: { domain: string }) => {
    const reduceMotion = useReducedMotion()
    const [t, setT] = useState(reduceMotion ? END_AT : 0)
    const [copied, setCopied] = useState(false)
    const finished = t >= END_AT
    const ctaRef = useRef<HTMLElement>(null)
    // Only scroll to the ending after the story actually played, not when it starts finished
    const played = useRef(false)
    if (!finished) played.current = true

    useEffect(() => {
        if (finished && played.current) track('demo_finished', { domain })
    }, [finished, domain])

    useEffect(() => {
        if (finished) return
        const id = setTimeout(() => setT((x) => Math.min(END_AT, Math.round((x + 0.1) * 10) / 10)), 100)
        return () => clearTimeout(id)
    }, [t, finished])

    const stepIndex = STEPS.reduce((acc, s, i) => (t >= s.at ? i : acc), 0)
    const narration = finished ? 'Done. Here’s the catch…' : STEPS[stepIndex]!.text

    const tabs = Object.fromEntries(REGISTRARS.map((r, i) => {
        const tab: StoryTab = { phase: phaseAt(r.name, i, t), price: <HiddenPrice /> }
        return [r.name, tab]
    })) as Record<Registrar, StoryTab>

    async function copyCommand() {
        track('copy_command')
        try {
            await navigator.clipboard.writeText(COMMAND)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch {
            // Clipboard blocked: the command is still selectable on the page
        }
    }

    return (
        <div className="story">
            <div className="story-head">
                <h2 style={{ fontWeight: 500 }}>
                    Results for <span style={{ color: '#f5a623' }}>{domain}</span>
                </h2>
                <span className="story-demo-pill">DEMO</span>
                {!finished && (
                    <button className="story-skip" onClick={() => { track('demo_skipped', { at_seconds: t }); setT(END_AT) }}>Skip ›</button>
                )}
            </div>

            <StorySteps active={stepIndex} finished={finished} />
            <StoryNarration text={narration} />

            <AnimatePresence mode="wait" initial={false}>
                {t < COMPARE_AT ? (
                    <StoryBrowser
                        key="browser"
                        domain={domain}
                        address={t < TABS_AT ? 'about:blank' : `Chrome · 6 tabs · ${domain}`}
                        tabs={tabs}
                    />
                ) : (
                    <motion.div
                        key="compare"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: EASE_OUT }}
                    >
                        <div className="story-rec">
                            <div className="story-rec-label">RECOMMENDED — LOWEST PRICE</div>
                            <div className="story-rec-body">
                                <div className="story-rec-who">
                                    <span className="story-mystery">?</span>
                                    <div>
                                        <div className="story-rec-title">Hidden in the demo</div>
                                        <div className="story-rec-sub">Run it on your machine to see who’s cheapest for {domain}</div>
                                    </div>
                                </div>
                                <HiddenPrice />
                            </div>
                        </div>

                        <div className="story-list-label">ALL 6 REGISTRARS CHECKED</div>
                        <div className="story-list">
                            {REGISTRARS.map((r, i) => (
                                <motion.div
                                    key={r.name}
                                    className="story-row"
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.05 * i, duration: 0.25, ease: 'easeOut' }}
                                >
                                    <div className="story-row-who">
                                        <RegistrarLogo registrar={r.name} size={32} />
                                        <span>{r.label}</span>
                                    </div>
                                    <span className="story-row-badge"><Check />Checked</span>
                                    <HiddenPrice />
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {finished && (
                    <motion.section
                        ref={ctaRef}
                        className="story-cta"
                        onAnimationComplete={() => {
                            if (played.current) ctaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
                        }}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: reduceMotion ? 0 : 0.15, duration: 0.45, ease: EASE_OUT }}
                    >
                        <p className="story-cta-eyebrow">That was a replay.</p>
                        <h3>Registrars block cloud servers. Your laptop gets through.</h3>
                        <p className="story-cta-copy">
                            GoDaddy and Hostinger turn servers away with bot checks, so the real Domainak runs
                            on your computer. It drives a real Chrome quietly in the background, checks all 6
                            registrars in about 15 seconds, and shows you the actual prices.
                        </p>

                        <div className="story-cmd">
                            <code><span className="story-cmd-prompt">$</span>{COMMAND}</code>
                            <button onClick={copyCommand}>{copied ? 'Copied ✓' : 'Copy'}</button>
                        </div>
                        <p className="story-cta-note">
                            Paste it into a terminal. You need <a href="https://nodejs.org" target="_blank" rel="noopener noreferrer">Node 18+</a> and
                            Google Chrome. It opens at localhost:8000 by itself.
                        </p>

                        <div className="story-cta-actions">
                            <a className="story-btn-light" href={REPO_URL} target="_blank" rel="noopener noreferrer" onClick={() => track('github_click', { placement: 'demo_end' })}>View on GitHub</a>
                            <button className="story-btn-ghost" onClick={() => { track('demo_replay'); setT(0) }}>Replay demo</button>
                        </div>
                    </motion.section>
                )}
            </AnimatePresence>
        </div>
    )
}

export default DemoStory
