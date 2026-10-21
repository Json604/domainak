import { COUNTRY_CURRENCY, detectCountry } from './location'
import type { RegistrarResult } from '../types'

// Units of each currency per 1 USD
export type Rates = Record<string, number>

const STORAGE_KEY = 'domainak:currency'

// Everything the currency picker offers
export const PICKER_CURRENCIES = [...new Set(['USD', 'EUR', ...Object.values(COUNTRY_CURRENCY)])].sort()

export const detectCurrency = (): string => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) return saved
    } catch {
        // Storage blocked: fall through to detection
    }
    const country = detectCountry()
    return (country && COUNTRY_CURRENCY[country]) || 'USD'
}

export const saveCurrency = (currency: string) => {
    try {
        localStorage.setItem(STORAGE_KEY, currency)
    } catch {
        // Storage blocked: the choice just won't stick
    }
}

export const formatMoney = (amount: number, currency: string) => {
    const whole = amount >= 100 || Number.isInteger(amount)
    try {
        return new Intl.NumberFormat(undefined, {
            style: 'currency',
            currency,
            minimumFractionDigits: whole ? 0 : 2,
            maximumFractionDigits: whole ? 0 : 2,
        }).format(amount)
    } catch {
        return `${currency} ${amount.toFixed(2)}`
    }
}

export interface PriceView {
    // What to show, in the visitor's currency when we can convert
    main: string | null
    // The registrar's own price, when `main` is a conversion
    original: string | null
    // For ranking registrars against each other
    usd: number | null
}

export const priceView = (value: RegistrarResult, display: string, rates: Rates | null): PriceView => {
    const { amount, currency: from } = value
    if (amount == null || !from) {
        // Unparsed price: show it exactly as the registrar did
        const raw = value.price === null || value.price === '' ? null : String(value.price)
        return { main: raw, original: null, usd: null }
    }

    const usd = from === 'USD' ? amount : rates?.[from] ? amount / rates[from] : null
    if (from === display) return { main: formatMoney(amount, from), original: null, usd }

    const perUsd = rates?.[display]
    if (usd !== null && perUsd) {
        return { main: `≈ ${formatMoney(usd * perUsd, display)}`, original: formatMoney(amount, from), usd }
    }
    return { main: formatMoney(amount, from), original: null, usd }
}
