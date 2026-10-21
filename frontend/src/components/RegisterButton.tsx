import type {Registrar} from "../types"
import { track } from "../analytics"

interface RegisterButtonProps {
    registrar?: Registrar
    domain?: string
    // The registrar's own page for this domain in the market we priced, when it gave one
    url?: string | undefined
    disabled?: boolean
}

// Straight to each registrar's own search for the domain, ready to add to cart.
// Add affiliate links here later.
const searchUrls: Record<Registrar, (domain: string) => string> = {
    'Godaddy': (d) => `https://www.godaddy.com/domainsearch/find?domainToCheck=${d}`,
    'Namecheap': (d) => `https://www.namecheap.com/domains/registration/results/?domain=${d}`,
    'Porkbun': (d) => `https://porkbun.com/checkout/search?q=${d}`,
    'Dynadot': (d) => `https://www.dynadot.com/domain/search?domain=${d}`,
    'Hostinger': (d) => `https://www.hostinger.com/domain-name-results?domain=${d}&from=domain-name-search`,
    'Spaceship': (d) => `https://www.spaceship.com/domain-search/?query=${d}&tab=domains`,
}

const RegisterButton = ({ registrar, domain = '', url, disabled = false }: RegisterButtonProps) => {
    if (disabled || !registrar) {
        return (
            <button style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '0.5rem',
                border: 'none',
                backgroundColor: '#e8e8e8',
                color: '#aaa',
                fontSize: '0.9rem',
                cursor: 'not-allowed',
            }}>
                —
            </button>
        )
    }

    return (
        <a 
            href={url ?? searchUrls[registrar](encodeURIComponent(domain))}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track('register_click', { registrar, domain })}
            style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '0.5rem',
                border: 'none',
                backgroundColor: '#111',
                color: '#fff',
                fontSize: '0.9rem',
                cursor: 'pointer',
                textDecoration: 'none',
            }}
        >
            Register
        </a>
    )
}

export default RegisterButton
