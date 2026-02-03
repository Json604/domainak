import { useState, useEffect,  } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { parse } from 'tldts'
import zigzag from '../assets/Vector 1.svg'
import heart from '../assets/heart.svg'
import './result.css'
import handloader from '../assets/handLoader.json'
import Lottie from "lottie-react"

export const ResultPage = () => {
    const [searchParams] = useSearchParams()
    const searchDomain = searchParams.get('domain')
    const [data, setData] = useState('')
    // const [loading, setLoading] = useState(false)
    const [loading, setLoading] = useState(true)
    const [domain, setDomain] = useState('')
    const [error, setError] = useState(false)
    const nav = useNavigate()

    useEffect(() => {
        fetch(`http://localhost:8000/search?q=${searchDomain}`)
        .then(res => res.json())
        .then(data => {
            setData(data)
            setLoading(false)
        })
        .catch()
    },[searchDomain])

    function handleSearch(){
        setLoading(true)
        const parsed = parse(domain.trim())
        if (!domain.trim() || !parsed.domain || !parsed.publicSuffix) {
            setError(true)
            return
        }
        
        setError(false)
        const encodedDomain = encodeURIComponent(domain)
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
                <button className="icon-button" aria-label="favorites">
                <img src={heart} width={22} height={22} alt="favorites" />
                </button>
                <a className="signin">Sign in</a>
            </div>
        </div>

        <div className="results-main">
            {loading ? (<Lottie className="loading-animation" animationData={handloader}/>)
            :(
            <>
            <div className="domainSearched">
                <div className="searchedUpper">
                    <h2 style={{fontWeight:500}}>Results for <span style={{color: '#f5a623'}}>{searchDomain}</span> </h2>
                    <div className="status_bullet">Available</div>
                </div>
                
                <h5 style={{fontWeight:500 , color:'gray'}}>Checked across 6 registrars</h5>
            </div>
            
            <div className="recomended">
                <div className="recUpper">RECOMENDED — LOWEST PRICE</div>
                <div className="recLower">MOCK</div>
            </div>

            <div className="others"></div>
            </>
            )}
        </div>

        {/* <div className="alternatives"></div> */}
        </>
    )
}