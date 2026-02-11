import type { PromiseResult } from '../types'
import RegistrarCard from './RegistrarCard'

interface ResultsListProps{
    results?: PromiseResult[]
}

const ResultsList = ({ results }: ResultsListProps) => {
    if (!results || results.length === 0) return null

    // Parse price to number for comparison
    const parsePrice = (price: string | number | null) => {
        if (!price) return Infinity
        if (typeof price === 'number') return price
        const num = parseFloat(price.replace(/[^0-9.]/g, ''))
        return isNaN(num) ? Infinity : num
    }

    // Helper to check if result is purchasable (available or aftermarket)
    const isPurchasable = (r: PromiseResult) => {
        if (r.status !== 'fulfilled') return false
        const status = r.value?.status
        const statusStr = typeof status === 'string' ? status.toLowerCase() : ''
        return status === true || statusStr === 'available' || statusStr.includes('aftermarket')
    }

    // Filter purchasable results and sort by price
    const availableResults = results
        .filter(isPurchasable)
        .sort((a, b) => {
        // After isPurchasable filter, we know these are fulfilled
        if (a.status === 'fulfilled' && b.status === 'fulfilled') {
            return parsePrice(a.value.price) - parsePrice(b.value.price)
        }
        return 0
    })
    
    // Get unavailable/failed results
    const otherResults = results.filter((r:PromiseResult) => !isPurchasable(r))

    const recommended = availableResults[0]
    const restAvailable = availableResults.slice(1)

    return (
        <div>
            {recommended && (
                <RegistrarCard result={recommended} isRecommended />
            )}

            {(restAvailable.length > 0 || otherResults.length > 0) && (
                <div>
                    <div style={{
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: '#666',
                        marginBottom: '0.75rem',
                        letterSpacing: '0.5px',
                    }}>
                        OTHER REGISTRARS
                    </div>
                    <div style={{
                        borderRadius: '0.75rem',
                        overflow: 'hidden',
                        border: '1px solid #eee',
                    }}>
                        {restAvailable.map((result: PromiseResult, i: number) => (
                            <RegistrarCard key={i} result={result} />
                        ))}
                        {otherResults.map((result: PromiseResult, i: number) => (
                            <RegistrarCard key={`other-${i}`} result={result} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default ResultsList
