import '../App.css'
import Marquee from "react-fast-marquee";
import hostinger from '../assets/hostinger.svg'
import godaddy from '../assets/godaddy.svg'
import namecheap from '../assets/namecheap.svg'
import spaceship from '../assets/spaceship.svg'
import porkbun from '../assets/porkbun.svg'
import dynadot from '../assets/dynadot.svg'
import domainr from '../assets/domainr.svg'

const LogoMarquee = () => {
    return(
        <Marquee speed={40} gradient={false} className="providers-row">
                <img className="provider-logo" src={domainr} alt="Domainr" />
                <img className="provider-logo hostinger-logo" src={hostinger} alt="Hostinger" />
                <img className="provider-logo" src={godaddy} alt="GoDaddy" />
                <img className="provider-logo" src={namecheap} alt="Namecheap" />
                <img className="provider-logo" src={spaceship} alt="Spaceship" />
                <img className="provider-logo porkbun-logo" src={porkbun} alt="Porkbun" />
                <img className="provider-logo" src={dynadot} alt="Dynadot" />

                <img className="provider-logo" src={domainr} alt="Domainr" />
                <img className="provider-logo hostinger-logo" src={hostinger} alt="Hostinger" />
                <img className="provider-logo" src={godaddy} alt="GoDaddy" />
                <img className="provider-logo" src={namecheap} alt="Namecheap" />
                <img className="provider-logo" src={spaceship} alt="Spaceship" />
                <img className="provider-logo porkbun-logo" src={porkbun} alt="Porkbun" />
                <img className="provider-logo" src={dynadot} alt="Dynadot" />

                <img className="provider-logo" src={domainr} alt="Domainr" />
                <img className="provider-logo hostinger-logo" src={hostinger} alt="Hostinger" />
                <img className="provider-logo" src={godaddy} alt="GoDaddy" />
                <img className="provider-logo" src={namecheap} alt="Namecheap" />
                <img className="provider-logo" src={spaceship} alt="Spaceship" />
                <img className="provider-logo porkbun-logo" src={porkbun} alt="Porkbun" />
                <img className="provider-logo" src={dynadot} alt="Dynadot" />

                <img className="provider-logo" src={domainr} alt="Domainr" />
                <img className="provider-logo hostinger-logo" src={hostinger} alt="Hostinger" />
                <img className="provider-logo" src={godaddy} alt="GoDaddy" />
                <img className="provider-logo" src={namecheap} alt="Namecheap" />
                <img className="provider-logo" src={spaceship} alt="Spaceship" />
                <img className="provider-logo porkbun-logo" src={porkbun} alt="Porkbun" />
                <img className="provider-logo" src={dynadot} alt="Dynadot" />
        </Marquee>
    )
}

export default LogoMarquee