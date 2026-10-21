// ADD THIS LATER > Some links on this site are affiliate links. We may earn a commission at no extra cost to you.
import './App.css'
import zigzag from './assets/Vector 1.svg'
import LogoMarquee from './components/logoMarquee'
import Loader from './components/loader_animations/loader'
import SocialLinks from './components/SocialLinks'
import HistoryMenu from './components/HistoryMenu'
import { track } from './analytics'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { readDomain } from './domain'

function App() {
  const [domain, setDomain] = useState('')
  const [error, setError] = useState(false)
  const nav = useNavigate()

  function handleSearch(){
    const read = readDomain(domain)
    if (!read) {
      setError(true)
      return
    }

    setError(false)
    track('search', { search_term: read.host, from: 'home' })
    // A subdomain goes through too: the results page explains it rather than guessing
    nav(`/results?domain=${encodeURIComponent(read.host)}`)
  }

  return (
    <>
    <Loader />
    <div className='page'>

      <div className='box1'>
        <header className="header">
          <div className="brand" style={{cursor:'pointer'}}>
            <span className="brand-name">DOMAINAK</span>
            <img src={zigzag} className="brand-underline" alt="" />
          </div>
          <div className="header-actions">
            <HistoryMenu />
            <SocialLinks />
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
