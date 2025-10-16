import './App.css'
import zigzag from './assets/Vector 1.svg'
import heart from './assets/heart.svg'
import Marquee from "react-fast-marquee";
import googleDomain from './assets/googleDomain.svg'
import hostinger from './assets/hostinger.svg'
import godaddy from './assets/godaddy.svg'
import namecheap from './assets/namecheap.svg'
import spaceship from './assets/spaceship.svg'
import porkbun from './assets/porkbun.svg'
import dynadot from './assets/dynadot.svg'

function App() {
  return (
    <div className='page'>

      <div className='box1'>
        <header className="header">
          <div className="brand">
            <span className="brand-name">DOMAINAK</span>
            <img src={zigzag} className="brand-underline" alt="" />
          </div>
          <div className="header-actions">
            <button className="icon-button" aria-label="favorites">
              <img src={heart} width={22} height={22} alt="favorites" />
            </button>
            <a href="#" className="signin">Sign in</a>
          </div>
        </header>
      </div>

      <div className='box2'>
        <main className="hero">
          <div className='cta'>
            <p className="eyebrow">Stop guessing. <span className="accent">Search once.</span></p>
            <h1 className='title'>Comapare all.</h1>
          </div>
          <form className="search" onSubmit={(e) => e.preventDefault()}>
            <input className="search-input" placeholder="Search for a domain name to compare"/>
            <button className="search-btn" type="submit">Search</button>
          </form>

          <p className="subcopy">One search for all domains — availability, prices, registrars.</p>
        </main>
      </div>

      <div className='box3'>  
        <Marquee speed={40} gradient={false} className="providers-row">
            <img className="provider-logo" src={googleDomain} alt='Google Domains'/>
            <img className="provider-logo hostinger-logo" src={hostinger} alt='Hostinger'/>
            <img className="provider-logo" src={godaddy} alt='GoDaddy'/>
            <img className="provider-logo" src={namecheap} alt='Namecheap'/>
            <img className="provider-logo" src={spaceship} alt='Spaceship'/>
            <img className="provider-logo porkbun-logo" src={porkbun} alt='Porkbun'/>
            <img className="provider-logo" src={dynadot} alt='Dynadot'/>
        </Marquee>
      </div>  

    </div>
  )
}

export default App
