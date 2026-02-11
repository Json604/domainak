interface StatusBadgeProps{
    status: string | boolean
    size?: 'normal' | 'large'
}

const StatusBadge = ({ status, size = 'normal' }: StatusBadgeProps) => {
    const statusStr = typeof status === 'string' ? status.toLowerCase() : ''
    
    const isAvailable = status === true || statusStr === 'available'
    const isAftermarket = statusStr.includes('aftermarket')
    const isFetchError = status === 'rejected' || status === 'error'
    
    let label = 'Unavailable'
    let bgColor = '#f0f0f0'
    let textColor = '#888'
    
    if (isAvailable) {
        label = 'Available'
        bgColor = '#d4f5d4'
        textColor = '#2d8a2d'
    } else if (isAftermarket) {
        label = 'Aftermarket'
        bgColor = '#fff3cd'
        textColor = '#856404'
    } else if (isFetchError) {
        label = "Couldn't fetch"
        bgColor = 'transparent'
        textColor = '#e67e22'
    }

    const styles = {
        normal: {
            padding: '0.25rem 0.75rem',
            fontSize: '0.8rem',
            borderRadius: '1rem',
        },
        large: {
            padding: '0.3rem 1rem',
            fontSize: '0.9rem',
            borderRadius: '1rem',
        }
    }

    return (
        <span style={{
            ...styles[size],
            backgroundColor: bgColor,
            color: textColor,
            fontWeight: 500,
        }}>
            {label}
        </span>
    )
}

export default StatusBadge
