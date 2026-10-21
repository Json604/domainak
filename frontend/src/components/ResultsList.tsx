import type { PromiseResult, RegistrarResult } from '../types'
import RegistrarCard from './RegistrarCard'
import { usePricing } from '../pricing/context'

interface ResultsListProps{
    results?: PromiseResult[]
    domain: string
}

const ResultsList = ({ results, domain }: ResultsListProps) => {
    const { view, rates } = usePricing()
    if (!results || results.length === 0) return null

    // Parse price to number for comparison
    const parsePrice = (price: string | number | null) => {
        if (!price) return Infinity
        if (typeof price === 'number') return price
        const num = parseFloat(price.replace(/[^0-9.]/g, ''))
        return isNaN(num) ? Infinity : num
    }

    // Compare in USD so ₹ and $ prices rank correctly; without rates, fall back to raw numbers
    const sortValue = (value: RegistrarResult) => view(value).usd ?? (rates ? Infinity : parsePrice(value.price))

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
            return sortValue(a.value) - sortValue(b.value)
        }
        return 0
    })
    
    // Get unavailable/failed results
    const otherResults = results.filter((r:PromiseResult) => !isPurchasable(r))

    // Only call something the lowest price when we know its price, and can compare
    // it: without exchange rates, ₹ and $ prices can't be ranked against each other
    const currencies = new Set(availableResults.flatMap((r) => {
        if (r.status !== 'fulfilled' || r.value.price === null || r.value.price === '') return []
        return [r.value.currency ?? '?']
    }))
    const comparable = rates !== null || currencies.size <= 1
    const cheapest = availableResults[0]
    const recommended = comparable && cheapest?.status === 'fulfilled' && Number.isFinite(sortValue(cheapest.value)) ? cheapest : undefined
    const restAvailable = recommended ? availableResults.slice(1) : availableResults

    return (
        <div>
            {recommended && (
                <RegistrarCard result={recommended} domain={domain} isRecommended />
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
                            <RegistrarCard key={i} result={result} domain={domain} />
                        ))}
                        {otherResults.map((result: PromiseResult, i: number) => (
                            <RegistrarCard key={`other-${i}`} result={result} domain={domain} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default ResultsList
