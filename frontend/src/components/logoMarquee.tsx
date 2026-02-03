import '../App.css'
import Marquee from "react-fast-marquee";
import hostinger from '../assets/hostinger/h_main.svg'
import godaddy from '../assets/godaddy/g_main.svg'
import namecheap from '../assets/namecheap/n_main.svg'
import spaceship from '../assets/spaceship/s_main.svg'
import porkbun from '../assets/porkbun/p_main.svg'
import dynadot from '../assets/dynadot/d_main.svg'

const LogoMarquee = () => {
    return(
        <Marquee speed={40} gradient={false} className="providers-row">
                <img className="provider-logo hostinger-logo" src={hostinger} alt="Hostinger" />
                <img className="provider-logo" src={godaddy} alt="GoDaddy" />
                <img className="provider-logo" src={namecheap} alt="Namecheap" />
                <img className="provider-logo" src={spaceship} alt="Spaceship" />
                <img className="provider-logo porkbun-logo" src={porkbun} alt="Porkbun" />
                <img className="provider-logo" src={dynadot} alt="Dynadot" />

                <img className="provider-logo hostinger-logo" src={hostinger} alt="Hostinger" />
                <img className="provider-logo" src={godaddy} alt="GoDaddy" />
                <img className="provider-logo" src={namecheap} alt="Namecheap" />
                <img className="provider-logo" src={spaceship} alt="Spaceship" />
                <img className="provider-logo porkbun-logo" src={porkbun} alt="Porkbun" />
                <img className="provider-logo" src={dynadot} alt="Dynadot" />

                <img className="provider-logo hostinger-logo" src={hostinger} alt="Hostinger" />
                <img className="provider-logo" src={godaddy} alt="GoDaddy" />
                <img className="provider-logo" src={namecheap} alt="Namecheap" />
                <img className="provider-logo" src={spaceship} alt="Spaceship" />
                <img className="provider-logo porkbun-logo" src={porkbun} alt="Porkbun" />
                <img className="provider-logo" src={dynadot} alt="Dynadot" />

                <img className="provider-logo hostinger-logo" src={hostinger} alt="Hostinger" />
                <img className="provider-logo" src={godaddy} alt="GoDaddy" />
                <img className="provider-logo" src={namecheap} alt="Namecheap" />
                <img className="provider-logo" src={spaceship} alt="Spaceship" />
                <img className="provider-logo porkbun-logo" src={porkbun} alt="Porkbun" />
                <img className="provider-logo" src={dynadot} alt="Dynadot" />

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