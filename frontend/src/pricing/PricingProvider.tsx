import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { PricingContext, type Pricing } from './context'
import { detectCurrency, priceView, saveCurrency, type Rates } from './currency'
import { API_URL, IS_DEMO } from '../config'
import { track } from '../analytics'

// Shows every price in the visitor's currency, using rates from the backend
const PricingProvider = ({ children }: { children: ReactNode }) => {
    const [currency, setCurrencyState] = useState(detectCurrency)
    const [rates, setRates] = useState<Rates | null>(null)
    const [updatedAt, setUpdatedAt] = useState<string | null>(null)

    useEffect(() => {
        // The demo has no backend and no prices to convert
        if (IS_DEMO) return
        let cancelled = false
        fetch(`${API_URL}/rates`)
            .then((res) => res.json())
            .then((json: { success: boolean, data?: { rates: Rates, updatedAt: string } }) => {
                if (cancelled || !json.success || !json.data) return
                setRates(json.data.rates)
                setUpdatedAt(json.data.updatedAt)
            })
            // No rates: prices stay in each registrar's own currency
            .catch(() => {})
        return () => { cancelled = true }
    }, [])

    const setCurrency = useCallback((next: string) => {
        setCurrencyState(next)
        saveCurrency(next)
        track('currency_change', { currency: next })
    }, [])

    const value = useMemo<Pricing>(() => ({
        currency,
        setCurrency,
        rates,
        updatedAt,
        view: (result) => priceView(result, currency, rates),
    }), [currency, setCurrency, rates, updatedAt])

    return <PricingContext.Provider value={value}>{children}</PricingContext.Provider>
}

export default PricingProvider
