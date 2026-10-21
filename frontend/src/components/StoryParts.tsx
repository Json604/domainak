import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import RegistrarLogo from './RegistrarLogo'
import { EASE_OUT, REGISTRARS, STEP_LABELS, type Phase } from './storyData'
import type { Registrar } from '../types'
import './story.css'

// Building blocks shared by the staged demo and the live search story

const PHASE_PROGRESS: Record<Phase, number> = { hidden: 0, loading: 0.35, bot: 0.55, reading: 0.8, done: 1, taken: 1, failed: 1 }

const Spinner = () => <span className="story-spinner" aria-hidden="true" />

const Shield = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
)

export const Check = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 6 9 17l-5-5" />
    </svg>
)

// Never a made-up number: the demo has no real prices to show
export const HiddenPrice = () => (
    <span className="story-price">
        <span className="story-price-blur" aria-hidden="true">$00.00</span>
        <span className="sr-only">Price hidden in demo</span>
    </span>
)

export const StorySteps = ({ active, finished }: { active: number, finished: boolean }) => (
    <ol className="story-steps">
        {STEP_LABELS.map((label, i) => (
            <li key={label} className={finished || i < active ? 'is-done' : i === active ? 'is-active' : ''}>
                <span className="story-step-dot" />
                {label}
            </li>
        ))}
    </ol>
)

export const StoryNarration = ({ text }: { text: string }) => (
    <div className="story-narration" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
            <motion.p
                key={text}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
            >
                {text}
            </motion.p>
        </AnimatePresence>
    </div>
)

export interface StoryTab {
    phase: Phase
    // What a finished tab says, e.g. "Price found" or "Taken"
    doneLabel?: string
    price?: ReactNode
}

const TabStatus = ({ tab }: { tab: StoryTab }) => {
    switch (tab.phase) {
        case 'loading': return <><Spinner />Loading page</>
        case 'bot': return <><Shield />Passing bot check</>
        case 'reading': return <><Spinner />Reading price data</>
        case 'done': return <><Check />{tab.doneLabel ?? 'Price found'} {tab.price}</>
        case 'taken': return <>{tab.doneLabel ?? 'Taken'}</>
        case 'failed': return <>{tab.doneLabel ?? 'Couldn’t fetch'}</>
        default: return null
    }
}

// A fake Chrome window holding one tab card per registrar
export const StoryBrowser = ({ domain, address, tabs }: { domain: string, address: string, tabs: Record<Registrar, StoryTab> }) => (
    <motion.div
        className="story-browser"
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
        transition={{ duration: 0.35, ease: EASE_OUT }}
    >
        <div className="story-browser-bar">
            <span className="story-light" />
            <span className="story-light" />
            <span className="story-light" />
            <div className="story-address">{address}</div>
        </div>

        <div className="story-grid">
            {REGISTRARS.map((r) => {
                const tab = tabs[r.name]
                const hidden = tab.phase === 'hidden'
                return (
                    <motion.div
                        key={r.name}
                        className={`story-tab is-${tab.phase}`}
                        initial={false}
                        animate={{ opacity: hidden ? 0 : 1, y: hidden ? 10 : 0 }}
                        transition={{ duration: 0.3, ease: EASE_OUT }}
                    >
                        <div className="story-tab-top">
                            <RegistrarLogo registrar={r.name} size={26} />
                            <span className="story-tab-name">{r.label}</span>
                        </div>
                        <div className="story-tab-url">{r.site}{domain}</div>
                        <div className="story-tab-status"><TabStatus tab={tab} /></div>
                        <div className="story-tab-progress">
                            <span style={{ transform: `scaleX(${PHASE_PROGRESS[tab.phase]})` }} />
                        </div>
                    </motion.div>
                )
            })}
        </div>
    </motion.div>
)
