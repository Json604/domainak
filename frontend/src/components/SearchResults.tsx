import { useCallback, useState } from 'react'
import { motion } from 'motion/react'
import StatusBadge from './StatusBadge'
import ResultsList from './ResultsList'
import LiveStory, { type SearchData } from './LiveStory'
import CurrencyPicker, { RatesNote } from './CurrencyPicker'
import { findInHistory, saveToHistory, timeAgo } from '../history'
import type { PromiseResult } from '../types'

interface SearchResultsProps {
    domain: string
    // Opened from history: show the saved results instead of searching again
    saved: boolean
    onCheckAgain: () => void
}

// One search, live or from history. Keyed per search by the page, so state starts fresh.
const SearchResults = ({ domain, saved, onCheckAgain }: SearchResultsProps) => {
    const [savedEntry] = useState(() => (saved ? findInHistory(domain) : null))
    const [data, setData] = useState<SearchData | null>(savedEntry && { domain: savedEntry.domain, result: savedEntry.result })
    const [loading, setLoading] = useState(!savedEntry)
    const [fetchError, setFetchError] = useState<string | null>(null)
    const [attempt, setAttempt] = useState(0)

    const handleDone = useCallback((result: SearchData) => {
        // Every registrar failed (offline, blocked...): say so, rather than listing six errors under "Unavailable"
        if (result.result.every((r) => r.status === 'rejected')) {
            setFetchError('Couldn’t reach any of the registrars. Check your internet connection and try again.')
        } else {
            saveToHistory(result.domain, result.result)
            setData(result)
        }
        setLoading(false)
    }, [])

    const handleError = useCallback((message: string) => {
        console.error('🔴 Search error:', message)
        setFetchError(message)
        setLoading(false)
    }, [])

    if (loading) {
        return <LiveStory key={attempt} domain={domain} onDone={handleDone} onError={handleError} />
    }

    if (fetchError) {
        return (
            <div className="error-state">
                <h2 style={{fontWeight:500, color: '#d14343'}}>Oops!</h2>
                <p style={{color: '#666', fontSize: '1.1rem'}}>{fetchError}</p>
                <button
                    onClick={() => { setFetchError(null); setLoading(true); setAttempt((a) => a + 1) }}
                    style={{
                        marginTop: '1rem',
                        padding: '0.75rem 2rem',
                        backgroundColor: '#111',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '0.5rem',
                        fontSize: '1rem',
                        cursor: 'pointer',
                    }}
                >
                    Try Again
                </button>
            </div>
        )
    }

    const anyAvailable = !!data?.result.some((r: PromiseResult) => {
        if (r.status !== 'fulfilled') return false
        const s = r.value?.status
        const str = typeof s === 'string' ? s.toLowerCase() : ''
        return s === true || str === 'available' || str.includes('aftermarket')
    })
    const failed = data?.result.filter((r) => r.status === 'rejected').length ?? 0

    return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}>
            <div className="domainSearched">
                <div className="searchedUpper">
                    <h2 style={{fontWeight:500}}>Results for <span style={{color: '#f5a623'}}>{domain}</span></h2>
                    {anyAvailable ? <StatusBadge status="available" size="large" />
                        // Only "Unavailable" when every registrar actually answered
                        : failed > 0 ? <span className="partial-badge">Couldn’t check {failed} of {data?.result.length}</span>
                        : <StatusBadge status="unavailable" size="large" />}
                </div>

                {savedEntry && (
                    <div className="saved-bar">
                        <span>Saved {timeAgo(savedEntry.at)}. Prices may have changed since.</span>
                        <button onClick={onCheckAgain}>Check again</button>
                    </div>
                )}

                <div className="results-meta">
                    <h5 style={{fontWeight:500 , color:'gray'}}>Checked across 6 registrars</h5>
                    <CurrencyPicker />
                </div>
            </div>

            <ResultsList results={data?.result} domain={domain} />
            <RatesNote />
        </motion.div>
    )
}

export default SearchResults
