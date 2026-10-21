import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { parse } from 'tldts'
import zigzag from '../assets/Vector 1.svg'
import './result.css'
import SocialLinks from '../components/SocialLinks'
import HistoryMenu from '../components/HistoryMenu'
import { track } from '../analytics'
import DemoStory from '../components/DemoStory'
import SearchResults from '../components/SearchResults'
import PricingProvider from '../pricing/PricingProvider'
import { IS_DEMO } from '../config'

export const ResultPage = () => {
    const [searchParams] = useSearchParams()
    const searchDomain = searchParams.get('domain')
    const saved = searchParams.get('saved') === '1'
    const [domain, setDomain] = useState('')
    const [error, setError] = useState(false)
    const [retryKey, setRetryKey] = useState(0)
    const nav = useNavigate()

    function handleSearch(){
        const parsed = parse(domain.trim())
        if (!domain.trim() || !parsed.domain || !parsed.publicSuffix) {
            setError(true)
            return
        }

        setError(false)
        track('search', { search_term: domain.trim(), from: 'results' })
        const encodedDomain = encodeURIComponent(domain.trim())

        // If same domain, trigger retry (live, even if it was opened from history). Otherwise navigate.
        if (encodedDomain === searchDomain) {
            setRetryKey(prev => prev + 1)
        }
        nav(`/results?domain=${encodedDomain}`)
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
                <HistoryMenu />
                <SocialLinks />
            </div>
        </div>

        <div className="results-main">
            <PricingProvider>
            {IS_DEMO ? (<DemoStory key={`${searchDomain}-${retryKey}`} domain={searchDomain || 'yourname.com'} />)
            : (<SearchResults
                key={`${searchDomain}-${retryKey}-${saved}`}
                domain={searchDomain ?? ''}
                saved={saved}
                onCheckAgain={() => nav(`/results?domain=${encodeURIComponent(searchDomain ?? '')}`)}
            />)}
            </PricingProvider>
        </div>

        {/* <div className="alternatives"></div> */}
        </>
    )
}
