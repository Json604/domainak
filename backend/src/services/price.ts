// Turns a displayed price like "₹ 1,599.00", "$8.88" or "11,99 €" into an amount + ISO currency.
// Only the symbols the registrars actually show; registrars that report their
// currency code (GoDaddy, Dynadot, Hostinger) use that instead.
const SYMBOLS: Record<string, string> = { '₹': 'INR', '$': 'USD', 'US$': 'USD', '€': 'EUR', '£': 'GBP' }

// Handles both "1,299.00" and the European "1.299,00" / "1 299,00": the last
// separator is the decimal mark only when 1-2 digits follow it
export const parseAmount = (text: string | number | null | undefined) => {
    if (typeof text === 'number') return Number.isFinite(text) ? text : null
    if (!text) return null
    const digits = text.replace(/[^0-9.,]/g, '')
    const lastSep = Math.max(digits.lastIndexOf('.'), digits.lastIndexOf(','))
    const decimals = lastSep === -1 ? 0 : digits.length - lastSep - 1
    const normalized = lastSep !== -1 && decimals > 0 && decimals <= 2
        ? `${digits.slice(0, lastSep).replace(/[.,]/g, '')}.${digits.slice(lastSep + 1)}`
        : digits.replace(/[.,]/g, '')
    const amount = parseFloat(normalized)
    return Number.isFinite(amount) ? amount : null
}

export const parseDisplayPrice = (display: string | null | undefined) => {
    const amount = parseAmount(display)
    if (amount === null || !display) return { amount: null, currency: null }
    const symbol = display.replace(/[0-9.,\s  ]/g, '')
    return { amount, currency: SYMBOLS[symbol] ?? null }
}

export const NO_PRICE = { price: null, amount: null, currency: null }
