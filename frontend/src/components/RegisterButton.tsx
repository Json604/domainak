const RegisterButton = ({ registrar, disabled = false }) => {
    // Add affiliate/registration links here later
    const links = {
        'Godaddy': 'https://godaddy.com',
        'Namecheap': 'https://namecheap.com',
        'Porkbun': 'https://porkbun.com',
        'Dynadot': 'https://dynadot.com',
        'Hostinger': 'https://hostinger.com',
        'Spaceship': 'https://spaceship.com',
    }

    if (disabled) {
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
            href={links[registrar]} 
            target="_blank" 
            rel="noopener noreferrer"
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
