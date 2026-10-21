import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { readDomain } from '../domain'
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
    // Cleaned the same way as the search box, in case the URL was typed or pasted
    const search = readDomain(searchParams.get('domain'))
    const searchDomain = search && !search.isSubdomain ? search.domain : null
    const saved = searchParams.get('saved') === '1'
    const [domain, setDomain] = useState('')
    const [error, setError] = useState(false)
    const [retryKey, setRetryKey] = useState(0)
    const nav = useNavigate()

    function handleSearch(){
        const read = readDomain(domain)
        if (!read) {
            setError(true)
            return
        }

        setError(false)
        track('search', { search_term: read.host, from: 'results' })

        // If same domain, trigger retry (live, even if it was opened from history). Otherwise navigate.
        if (read.host === search?.host) {
            setRetryKey(prev => prev + 1)
        }
        nav(`/results?domain=${encodeURIComponent(read.host)}`)
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
            {search?.isSubdomain ? (
            <div className="error-state">
                <h2 style={{fontWeight:500, overflowWrap: 'anywhere'}}>{search.host} can’t be registered on its own</h2>
                <p style={{color: '#666', fontSize: '1.1rem'}}>
                    It’s a subdomain of <strong>{search.domain}</strong>: registrars only sell the name right before the ending.
                    Check it for a typo, or search {search.domain} instead.
                </p>
                <button
                    onClick={() => nav(`/results?domain=${encodeURIComponent(search.domain)}`)}
                    style={{ marginTop: '1rem', padding: '0.75rem 2rem', backgroundColor: '#111', color: '#fff', border: 'none', borderRadius: '0.5rem', fontSize: '1rem', cursor: 'pointer' }}
                >
                    Search {search.domain}
                </button>
            </div>
            )
            : IS_DEMO ? (<DemoStory key={`${searchDomain}-${retryKey}`} domain={searchDomain || 'yourname.com'} />)
            : searchDomain ? (<SearchResults
                key={`${searchDomain}-${retryKey}-${saved}`}
                domain={searchDomain}
                saved={saved}
                onCheckAgain={() => nav(`/results?domain=${encodeURIComponent(searchDomain)}`)}
            />)
            : (
            <div className="error-state">
                <h2 style={{fontWeight:500}}>That doesn’t look like a domain</h2>
                <p style={{color: '#666', fontSize: '1.1rem'}}>Search for a full domain name, like example.com.</p>
            </div>
            )}
            </PricingProvider>
        </div>

        {/* <div className="alternatives"></div> */}
        </>
    )
}
