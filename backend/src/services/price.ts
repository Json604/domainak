// Turns a displayed price like "₹ 1,599.00" or "$8.88" into an amount + ISO currency.
// Only the symbols the registrars actually show in the markets we scrape.
const SYMBOLS: Record<string, string> = { '₹': 'INR', '$': 'USD', 'US$': 'USD', '€': 'EUR', '£': 'GBP' }

export const parseDisplayPrice = (display: string | null | undefined) => {
    if (!display) return { amount: null, currency: null }
    const amount = parseFloat(display.replace(/[^0-9.]/g, ''))
    const currency = SYMBOLS[display.replace(/[0-9.,\s]/g, '')] ?? null
    return Number.isFinite(amount) && currency ? { amount, currency } : { amount: null, currency: null }
}

export const NO_PRICE = { price: null, amount: null, currency: null }
