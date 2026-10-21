import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { availableCount, clearHistory, timeAgo, useHistory } from '../history'
import { track } from '../analytics'

// Clock icon in the navbar, shown once there are past searches in this browser
const HistoryMenu = () => {
    const entries = useHistory()
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)
    const nav = useNavigate()

    useEffect(() => {
        if (!open) return
        const onPointer = (e: PointerEvent) => {
            if (!ref.current?.contains(e.target as Node)) setOpen(false)
        }
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false)
        }
        document.addEventListener('pointerdown', onPointer)
        document.addEventListener('keydown', onKey)
        return () => {
            document.removeEventListener('pointerdown', onPointer)
            document.removeEventListener('keydown', onKey)
        }
    }, [open])

    if (entries.length === 0) return null

    function openEntry(domain: string) {
        setOpen(false)
        track('history_open', { domain })
        nav(`/results?domain=${encodeURIComponent(domain)}&saved=1`)
    }

    return (
        <div className="history" ref={ref}>
            <button
                className="icon-button social-link"
                aria-label="Search history"
                aria-expanded={open}
                title="Search history"
                onClick={() => setOpen((o) => !o)}
            >
                <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
                    <path d="M3 3v5h5" />
                    <path d="M12 7v5l4 2" />
                </svg>
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        className="history-panel"
                        initial={{ opacity: 0, y: -4, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.98 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                    >
                        <div className="history-title">Recent searches</div>
                        <ul>
                            {entries.map((e) => {
                                const available = availableCount(e)
                                const allAnswered = e.result.every((r) => r.status === 'fulfilled')
                                return (
                                    <li key={e.domain}>
                                        <button onClick={() => openEntry(e.domain)}>
                                            <span className="history-domain">{e.domain}</span>
                                            <span className="history-meta">
                                                {available > 0 ? `Available at ${available} of ${e.result.length}` : allAnswered ? 'Taken everywhere' : 'Not available where checked'} · {timeAgo(e.at)}
                                            </span>
                                        </button>
                                    </li>
                                )
                            })}
                        </ul>
                        <button className="history-clear" onClick={() => { clearHistory(); setOpen(false) }}>
                            Clear history
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default HistoryMenu
