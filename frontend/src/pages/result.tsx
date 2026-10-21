import { useState, useEffect, useCallback } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { motion } from "motion/react"
import { parse } from 'tldts'
import zigzag from '../assets/Vector 1.svg'
import './result.css'
import StatusBadge from '../components/StatusBadge'
import ResultsList from '../components/ResultsList'
import SocialLinks from '../components/SocialLinks'
import { track } from '../analytics'
import DemoStory from '../components/DemoStory'
import LiveStory, { type SearchData } from '../components/LiveStory'
import CurrencyPicker, { RatesNote } from '../components/CurrencyPicker'
import PricingProvider from '../pricing/PricingProvider'
import { IS_DEMO } from '../config'
import type { PromiseResult } from "../types"

interface ApiResponse{
    success: boolean
    data: SearchData
}

export const ResultPage = () => {
    const [searchParams] = useSearchParams()
    const searchDomain = searchParams.get('domain')
    const [data, setData] = useState<ApiResponse | null>(null)
    // const [loading, setLoading] = useState(false)
    const [loading, setLoading] = useState(!IS_DEMO)
    const [domain, setDomain] = useState('')
    const [error, setError] = useState(false)
    const [fetchError, setFetchError] = useState<string | null>(null)
    const [retryKey, setRetryKey] = useState(0)
    const nav = useNavigate()

    // Each new search (or retry) goes back to the live story, which runs the search
    useEffect(() => {
        if (IS_DEMO) return
        setLoading(true)
        setFetchError(null)
        setData(null)
    },[searchDomain, retryKey])

    const handleDone = useCallback((result: SearchData) => {
        setData({ success: true, data: result })
        setLoading(false)
    }, [])

    const handleError = useCallback((message: string) => {
        console.error('🔴 Search error:', message)
        setFetchError(message)
        setLoading(false)
    }, [])

    function handleSearch(){
        const parsed = parse(domain.trim())
        if (!domain.trim() || !parsed.domain || !parsed.publicSuffix) {
            setError(true)
            return
        }
        
        setError(false)
        track('search', { search_term: domain.trim(), from: 'results' })
        const encodedDomain = encodeURIComponent(domain.trim())
        
        // If same domain, trigger retry. Otherwise navigate.
        if (encodedDomain === searchDomain) {
            setRetryKey(prev => prev + 1)
        } else {
            nav(`/results?domain=${encodedDomain}`)
        }
    }

    return(
        <>
        <div className='results-header'>
            <div className="home" onClick={() => nav('/')}>
                <span className="home-name">DOMAINAK</span>
                <img src={zigzag} className="home-underline" alt="logo-underline" />
            </div>
            
            <form className="results-search" onSubmit={(e) => e.preventDefault()} style={error ? { borderColor: '#d14343', animation: 'shake 0.4s' } : {}}>
                <input className="results-search-input" value={domain} onChange={(e) => { setDomain(e.target.value); setError(false); }} placeholder="Search for a domain name to compare"/>
                <button className="results-search-btn" type="submit" onClick={handleSearch}>Search</button>
            </form>

            <div className="other-actions">
                <SocialLinks />
            </div>
        </div>

        <div className="results-main">
            <PricingProvider>
            {IS_DEMO ? (<DemoStory key={`${searchDomain}-${retryKey}`} domain={searchDomain || 'yourname.com'} />)
            : loading ? (<LiveStory key={`${searchDomain}-${retryKey}`} domain={searchDomain ?? ''} onDone={handleDone} onError={handleError} />)
            : fetchError ? (
            <div className="error-state">
                <h2 style={{fontWeight:500, color: '#d14343'}}>Oops!</h2>
                <p style={{color: '#666', fontSize: '1.1rem'}}>{fetchError}</p>
                <button 
                    onClick={() => setRetryKey(prev => prev + 1)} 
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
            :(
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}>
            <div className="domainSearched">
                <div className="searchedUpper">
                    <h2 style={{fontWeight:500}}>Results for <span style={{color: '#f5a623'}}>{searchDomain}</span></h2>
                    <StatusBadge status={data?.data?.result?.some((r: PromiseResult) => {
                        if (r.status !== 'fulfilled') return false
                        const s = r.value?.status
                        const str = typeof s === 'string' ? s.toLowerCase() : ''
                        return s === true || str === 'available' || str.includes('aftermarket')
                    }) ? 'available' : 'unavailable'} size="large" />
                </div>
                
                <div className="results-meta">
                    <h5 style={{fontWeight:500 , color:'gray'}}>Checked across 6 registrars</h5>
                    <CurrencyPicker />
                </div>
            </div>
            
            <ResultsList results={data?.data?.result} domain={searchDomain ?? ''} />
            <RatesNote />
            </motion.div>
            )}
            </PricingProvider>
        </div>

        {/* <div className="alternatives"></div> */}
        </>
    )
}