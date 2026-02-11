import godaddy from '../assets/godaddy/g_logo.svg'
import namecheap from '../assets/namecheap/n_logo.svg'
import porkbun from '../assets/porkbun/p_logo.svg'
import dynadot from '../assets/dynadot/d_logo.svg'
import hostinger from '../assets/hostinger/h_logo.svg'
import spaceship from '../assets/spaceship/s_logo.svg'
import type { Registrar } from '../types'

const logos = {
    'Godaddy': godaddy,
    'Namecheap': namecheap,
    'Porkbun': porkbun,
    'Dynadot': dynadot,
    'Hostinger': hostinger,
    'Spaceship': spaceship,
}

interface RegistrarLogoProps{
    registrar: Registrar
    size?: number
}

const RegistrarLogo = ({ registrar, size = 40 }: RegistrarLogoProps) => {
    const logo = logos[registrar]
    
    if (!logo) return null

    return (
        <img 
            src={logo} 
            alt={registrar} 
            style={{ 
                width: size, 
                height: size,
                objectFit: 'contain'
            }} 
        />
    )
}

export default RegistrarLogo
