// ADD THIS LATER > Some links on this site are affiliate links. We may earn a commission at no extra cost to you.
import './App.css'
import zigzag from './assets/Vector 1.svg'
import heart from './assets/heart.svg'
import wip1 from './assets/wip1.svg' // [WIP] DELETE this line to revert
import wip2 from './assets/wip2.svg' // [WIP] DELETE this line to revert
import LogoMarquee from './components/logoMarquee'
import Loader from './components/loader_animations/loader'
import { useState, useEffect } from 'react' // [WIP] REVERT to: import { useState } from 'react'
// import { useNavigate } from 'react-router-dom' // [WIP] UNCOMMENT this line to revert
import { parse } from 'tldts'

function App() {
  const [domain, setDomain] = useState('')
  const [error, setError] = useState(false)
  const [showWip, setShowWip] = useState(false) // [WIP] DELETE this line to revert
  const [wipFrame, setWipFrame] = useState(0) // [WIP] DELETE this line to revert
  // const nav = useNavigate() // [WIP] UNCOMMENT this line to revert

  // [WIP] DELETE this entire useEffect block to revert
  useEffect(() => {
    if (!showWip) return
    const interval = setInterval(() => {
      setWipFrame((prev) => (prev === 0 ? 1 : 0))
    }, 500)
    return () => clearInterval(interval)
  }, [showWip])
  // [WIP] END of useEffect block to delete

  function handleSearch(){
    const parsed = parse(domain.trim())
    if (!domain.trim() || !parsed.domain || !parsed.publicSuffix) {
      setError(true)
      return
    }

    setError(false)
    // const encodedDomain = encodeURIComponent(domain.trim()) // [WIP] UNCOMMENT this line to revert
    // nav(`/results?domain=${encodedDomain}`) // [WIP] UNCOMMENT this line to revert
    setShowWip(true) // [WIP] DELETE this line to revert
  }

  return (
    <>
    <Loader />
    {/* [WIP] DELETE this entire WIP overlay block to revert */}
    {showWip && (
      <div
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: '#fff', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 1000, cursor: 'pointer',
        }}
        onClick={() => setShowWip(false)}
      >
        <img
          src={wipFrame === 0 ? wip1 : wip2}
          alt="Work in progress"
          style={{ maxWidth: '80%', maxHeight: '80%' }}
        />
      </div>
    )}
    {/* [WIP] END of WIP overlay block to delete */}
    <div className='page'>

      <div className='box1'>
        <header className="header">
          <div className="brand" style={{cursor:'pointer'}}>
            <span className="brand-name">DOMAINAK</span>
            <img src={zigzag} className="brand-underline" alt="" />
          </div>
          <div className="header-actions">
            <button className="icon-button" aria-label="favorites">
              <img src={heart} width={22} height={22} alt="favorites" />
            </button>
            <a className="signin">Sign in</a>
          </div>
        </header>
      </div>

      <div className='box2'>
        <main className="hero">
          <div className='cta'>
            <p className="eyebrow">Stop guessing. <span className="accent">Search once.</span></p>
            <h1 className='title'>Compare all.</h1>
          </div>
          <form className="search" onSubmit={(e) => e.preventDefault()} style={error ? { borderColor: '#d14343', animation: 'shake 0.4s' } : {}}>
            <input className="search-input" value={domain} onChange={(e) => { setDomain(e.target.value); setError(false); }} placeholder="Search for a domain name to compare"/>
            <button className="search-btn" type="submit" onClick={handleSearch}>Search</button>
          </form>
          {error && <p style={{ color: '#d14343', fontSize: '0.9rem', marginTop: '0.5rem' }}>Please enter a valid domain</p>}

          <p className="subcopy">One search for all domains — availability, prices, registrars.</p>
        </main>
      </div>

        <div className='box3'>  
          <LogoMarquee/>
        </div> 
    </div>
    
    </>
  )
}

export default App