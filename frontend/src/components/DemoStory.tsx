import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import RegistrarLogo from './RegistrarLogo'
import { REPO_URL } from '../config'
import { track } from '../analytics'
import type { Registrar } from '../types'
import './demoStory.css'

// Staged replay of what the real backend does. Times are in seconds;
// `done` is when that registrar's price data "arrives".
const REGISTRARS: { name: Registrar, label: string, site: string, botCheck?: boolean, done: number }[] = [
    { name: 'Godaddy', label: 'GoDaddy', site: 'godaddy.com/domainsearch/find?domainToCheck=', botCheck: true, done: 7.4 },
    { name: 'Namecheap', label: 'Namecheap', site: 'namecheap.com/domains/registration/results/?domain=', done: 3.8 },
    { name: 'Porkbun', label: 'Porkbun', site: 'porkbun.com/checkout/search?q=', done: 5.8 },
    { name: 'Dynadot', label: 'Dynadot', site: 'dynadot.com/domain/search?domain=', done: 4.6 },
    { name: 'Hostinger', label: 'Hostinger', site: 'hostinger.com/domain-name-results?domain=', botCheck: true, done: 6.8 },
    { name: 'Spaceship', label: 'Spaceship', site: 'spaceship.com/domain-search/?query=', done: 5.2 },
]

const STEPS = [
    { at: 0, label: 'Launch Chrome', text: 'Opening a real Chrome browser…' },
    { at: 1.2, label: 'Open registrars', text: 'Visiting all 6 registrars at the same time…' },
    { at: 2.6, label: 'Bot checks', text: 'Getting past bot checks, just like a normal visitor…' },
    { at: 3.6, label: 'Read prices', text: 'Catching each registrar’s own price data as the page loads…' },
    { at: 8.2, label: 'Compare', text: 'Lining up every price to find the cheapest…' },
]
const TABS_AT = 1.2
const BOT_AT = 2.6
const COMPARE_AT = 8.2
const END_AT = 9.8

const COMMAND = `git clone ${REPO_URL} && cd domainak && npm start`

type Phase = 'hidden' | 'loading' | 'bot' | 'reading' | 'done'

const phaseAt = (r: typeof REGISTRARS[number], i: number, t: number): Phase => {
    if (t < TABS_AT + i * 0.18) return 'hidden'
    if (t >= r.done) return 'done'
    if (t >= r.done - 0.9) return 'reading'
    if (r.botCheck && t >= BOT_AT) return 'bot'
    return 'loading'
}

const PHASE_PROGRESS: Record<Phase, number> = { hidden: 0, loading: 0.35, bot: 0.55, reading: 0.8, done: 1 }

const Spinner = () => <span className="story-spinner" aria-hidden="true" />

const Shield = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
)

const Check = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 6 9 17l-5-5" />
    </svg>
)

// Never a made-up number: the demo has no real prices to show
const HiddenPrice = () => (
    <span className="story-price">
        <span className="story-price-blur" aria-hidden="true">$00.00</span>
        <span className="sr-only">Price hidden in demo</span>
    </span>
)

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

            <ol className="story-steps">
                {STEPS.map((s, i) => (
                    <li key={s.label} className={finished || i < stepIndex ? 'is-done' : i === stepIndex ? 'is-active' : ''}>
                        <span className="story-step-dot" />
                        {s.label}
                    </li>
                ))}
            </ol>

            <div className="story-narration" aria-live="polite">
                <AnimatePresence mode="wait" initial={false}>
                    <motion.p
                        key={narration}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                    >
                        {narration}
                    </motion.p>
                </AnimatePresence>
            </div>

            <AnimatePresence mode="wait" initial={false}>
                {t < COMPARE_AT ? (
                    <motion.div
                        key="browser"
                        className="story-browser"
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
                        transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
                    >
                        <div className="story-browser-bar">
                            <span className="story-light" />
                            <span className="story-light" />
                            <span className="story-light" />
                            <div className="story-address">
                                {t < TABS_AT ? 'about:blank' : `Chrome · 6 tabs · ${domain}`}
                            </div>
                        </div>

                        <div className="story-grid">
                            {REGISTRARS.map((r, i) => {
                                const phase = phaseAt(r, i, t)
                                return (
                                    <motion.div
                                        key={r.name}
                                        className={`story-tab is-${phase}`}
                                        initial={false}
                                        animate={{ opacity: phase === 'hidden' ? 0 : 1, y: phase === 'hidden' ? 10 : 0 }}
                                        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                                    >
                                        <div className="story-tab-top">
                                            <RegistrarLogo registrar={r.name} size={26} />
                                            <span className="story-tab-name">{r.label}</span>
                                        </div>
                                        <div className="story-tab-url">{r.site}{domain}</div>
                                        <div className="story-tab-status">
                                            {phase === 'loading' && <><Spinner />Loading page</>}
                                            {phase === 'bot' && <><Shield />Passing bot check</>}
                                            {phase === 'reading' && <><Spinner />Reading price data</>}
                                            {phase === 'done' && <><Check />Price found <HiddenPrice /></>}
                                        </div>
                                        <div className="story-tab-progress">
                                            <span style={{ transform: `scaleX(${PHASE_PROGRESS[phase]})` }} />
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="compare"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
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
                        transition={{ delay: reduceMotion ? 0 : 0.15, duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
                    >
                        <p className="story-cta-eyebrow">That was a replay.</p>
                        <h3>Registrars block cloud servers. Your laptop gets through.</h3>
                        <p className="story-cta-copy">
                            GoDaddy and Hostinger turn servers away with bot checks, so the real Domainak runs
                            on your computer. It opens Chrome, checks all 6 registrars in about 15 seconds,
                            and shows you the actual prices.
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
