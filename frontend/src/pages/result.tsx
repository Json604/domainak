import { useState, useEffect,  } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { parse } from 'tldts'
import zigzag from '../assets/Vector 1.svg'
import heart from '../assets/heart.svg'
import './result.css'
import handloader from '../assets/handLoader.json'
import Lottie from "lottie-react"
import StatusBadge from '../components/StatusBadge'
import ResultsList from '../components/ResultsList'
import type { PromiseResult } from "../types"

interface ApiResponse{
    success: boolean
    data:{
        domain: string
        result: PromiseResult[]
    }
}

export const ResultPage = () => {
    const [searchParams] = useSearchParams()
    const searchDomain = searchParams.get('domain')
    const [data, setData] = useState<ApiResponse | null>(null)
    // const [loading, setLoading] = useState(false)
    const [loading, setLoading] = useState(true)
    const [domain, setDomain] = useState('')
    const [error, setError] = useState(false)
    const [fetchError, setFetchError] = useState<string | null>(null)
    const [retryKey, setRetryKey] = useState(0)
    const nav = useNavigate()

    useEffect(() => {
        setLoading(true)
        setFetchError(null)
        setData(null)
        fetch(`http://localhost:8000/search?q=${searchDomain}`)
        .then(res => {
            if (!res.ok) throw new Error('Server error')
            return res.json()
        })
        .then(data => {
            if (!data.success) {
                setFetchError(data.message || 'Something went wrong')
            } else {
                setData(data)
            }
            setLoading(false)
        })
        .catch((err) => {
            console.error('🔴 Fetch error:', err)
            setFetchError('Could not connect to server. Please try again.')
            setLoading(false)
        })
    },[searchDomain, retryKey])

    function handleSearch(){
        const parsed = parse(domain.trim())
        if (!domain.trim() || !parsed.domain || !parsed.publicSuffix) {
            setError(true)
            return
        }
        
        setError(false)
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
                <button className="icon-button" aria-label="favorites">
                <img src={heart} width={22} height={22} alt="favorites" />
                </button>
                <a className="signin">Sign in</a>
            </div>
        </div>

        <div className="results-main">
            {loading ? (<Lottie className="loading-animation" animationData={handloader}/>)
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
            <>
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
                
                <h5 style={{fontWeight:500 , color:'gray'}}>Checked across 6 registrars</h5>
            </div>
            
            <ResultsList results={data?.data?.result} />
            </>
            )}
        </div>

        {/* <div className="alternatives"></div> */}
        </>
    )
}