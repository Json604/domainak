import { useEffect, useState } from 'react'
import './App.css'
import zigzag from './assets/Vector 1.svg'
import heart from './assets/heart.svg'
import LogoMarquee from './components/logoMarquee'
import wip1 from './assets/wip1.svg'
import wip2 from './assets/wip2.svg'

function App() {
  const [searchPressed, setSearchPressed] = useState(false)
  const [wip, setWip] = useState(1)

  useEffect(() => {
    if(!searchPressed) return

    const interval = setInterval(() => {
      setWip(prev => (prev === 1 ? 2 : 1))
    },300)

    return () => clearInterval(interval)

  }, [searchPressed])

  return (
    <>
    <div className='page'>

      <div className='box1'>
        <header className="header">
          <div className="brand" onClick={() => setSearchPressed(false)} style={{cursor:'pointer'}}>
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

      {(!searchPressed) ? (
        <>
        <div className='box2'>
          <main className="hero">
            <div className='cta'>
              <p className="eyebrow">Stop guessing. <span className="accent">Search once.</span></p>
              <h1 className='title'>Compare all.</h1>
            </div>
            <form className="search" onSubmit={(e) => e.preventDefault()}>
              <input className="search-input" placeholder="Search for a domain name to compare"/>
              <button className="search-btn" type="submit" onClick={() => setSearchPressed(true)}>Search</button>
            </form>

            <p className="subcopy">One search for all domains — availability, prices, registrars.</p>
          </main>
        </div>
        </>
      ):(
        <div className='hero' style={{padding:0}}>
          <img src={wip === 1 ? wip1 : wip2} style={{width:'60vw', height:'70vh'}} alt='work in progress'/>
        </div>
      )} 
        <div className='box3'>  
          <LogoMarquee/>
        </div> 
    </div>
    
    </>
  )
}

export default App
