import type { RegistrarResult } from '../types'

// Units of each currency per 1 USD
export type Rates = Record<string, number>

const STORAGE_KEY = 'domainak:currency'

// Where the visitor is, from the browser alone (no network, no permission prompt):
// the timezone first, since it follows the machine; then the region in their language.
const TIMEZONE_CURRENCY: Record<string, string> = {
    'Asia/Kolkata': 'INR', 'Asia/Calcutta': 'INR',
    'Europe/London': 'GBP', 'Europe/Zurich': 'CHF', 'Europe/Stockholm': 'SEK', 'Europe/Oslo': 'NOK',
    'Europe/Copenhagen': 'DKK', 'Europe/Warsaw': 'PLN', 'Europe/Prague': 'CZK', 'Europe/Budapest': 'HUF',
    'Europe/Bucharest': 'RON', 'Europe/Istanbul': 'TRY', 'Europe/Kyiv': 'UAH', 'Europe/Kiev': 'UAH', 'Europe/Moscow': 'RUB',
    'Asia/Tokyo': 'JPY', 'Asia/Seoul': 'KRW', 'Asia/Shanghai': 'CNY', 'Asia/Hong_Kong': 'HKD', 'Asia/Taipei': 'TWD',
    'Asia/Singapore': 'SGD', 'Asia/Kuala_Lumpur': 'MYR', 'Asia/Jakarta': 'IDR', 'Asia/Manila': 'PHP',
    'Asia/Bangkok': 'THB', 'Asia/Ho_Chi_Minh': 'VND', 'Asia/Saigon': 'VND', 'Asia/Dubai': 'AED', 'Asia/Riyadh': 'SAR',
    'Asia/Qatar': 'QAR', 'Asia/Jerusalem': 'ILS', 'Asia/Karachi': 'PKR', 'Asia/Dhaka': 'BDT',
    'Asia/Kathmandu': 'NPR', 'Asia/Katmandu': 'NPR', 'Asia/Colombo': 'LKR',
    'Pacific/Auckland': 'NZD', 'Pacific/Honolulu': 'USD',
    'America/New_York': 'USD', 'America/Chicago': 'USD', 'America/Denver': 'USD', 'America/Los_Angeles': 'USD',
    'America/Phoenix': 'USD', 'America/Anchorage': 'USD', 'America/Detroit': 'USD', 'America/Boise': 'USD',
    'America/Toronto': 'CAD', 'America/Vancouver': 'CAD', 'America/Edmonton': 'CAD', 'America/Winnipeg': 'CAD',
    'America/Halifax': 'CAD', 'America/Regina': 'CAD', 'America/St_Johns': 'CAD',
    'America/Sao_Paulo': 'BRL', 'America/Mexico_City': 'MXN', 'America/Bogota': 'COP', 'America/Lima': 'PEN',
    'America/Santiago': 'CLP', 'Africa/Lagos': 'NGN', 'Africa/Johannesburg': 'ZAR', 'Africa/Nairobi': 'KES',
    'Africa/Cairo': 'EGP', 'Africa/Casablanca': 'MAD',
}
const TIMEZONE_PREFIX_CURRENCY: [string, string][] = [
    ['Australia/', 'AUD'], ['America/Argentina/', 'ARS'], ['America/Indiana/', 'USD'], ['America/Kentucky/', 'USD'],
]
const EURO_TIMEZONES = new Set([
    'Europe/Berlin', 'Europe/Paris', 'Europe/Madrid', 'Europe/Rome', 'Europe/Amsterdam', 'Europe/Brussels',
    'Europe/Vienna', 'Europe/Dublin', 'Europe/Lisbon', 'Europe/Helsinki', 'Europe/Athens', 'Europe/Luxembourg',
    'Europe/Bratislava', 'Europe/Ljubljana', 'Europe/Tallinn', 'Europe/Riga', 'Europe/Vilnius', 'Europe/Zagreb',
    'Europe/Malta', 'Europe/Monaco', 'Asia/Nicosia', 'Atlantic/Canary',
])
const REGION_CURRENCY: Record<string, string> = {
    US: 'USD', IN: 'INR', GB: 'GBP', CA: 'CAD', AU: 'AUD', NZ: 'NZD', CH: 'CHF', SE: 'SEK', NO: 'NOK', DK: 'DKK',
    PL: 'PLN', CZ: 'CZK', HU: 'HUF', RO: 'RON', TR: 'TRY', UA: 'UAH', RU: 'RUB', JP: 'JPY', KR: 'KRW', CN: 'CNY',
    HK: 'HKD', TW: 'TWD', SG: 'SGD', MY: 'MYR', ID: 'IDR', PH: 'PHP', TH: 'THB', VN: 'VND', AE: 'AED', SA: 'SAR',
    QA: 'QAR', IL: 'ILS', PK: 'PKR', BD: 'BDT', NP: 'NPR', LK: 'LKR', BR: 'BRL', MX: 'MXN', AR: 'ARS', CO: 'COP',
    CL: 'CLP', PE: 'PEN', NG: 'NGN', ZA: 'ZAR', KE: 'KES', EG: 'EGP', MA: 'MAD',
    DE: 'EUR', FR: 'EUR', ES: 'EUR', IT: 'EUR', NL: 'EUR', BE: 'EUR', AT: 'EUR', IE: 'EUR', PT: 'EUR', FI: 'EUR',
    GR: 'EUR', LU: 'EUR', SK: 'EUR', SI: 'EUR', EE: 'EUR', LV: 'EUR', LT: 'EUR', HR: 'EUR', MT: 'EUR', CY: 'EUR',
}

// Everything the currency picker offers
export const PICKER_CURRENCIES = [...new Set(['USD', 'EUR', ...Object.values(REGION_CURRENCY)])].sort()

const fromTimezone = () => {
    try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
        if (EURO_TIMEZONES.has(tz)) return 'EUR'
        return TIMEZONE_CURRENCY[tz] ?? TIMEZONE_PREFIX_CURRENCY.find(([prefix]) => tz.startsWith(prefix))?.[1] ?? null
    } catch {
        return null
    }
}

const fromLanguage = () => {
    for (const lang of navigator.languages ?? [navigator.language]) {
        try {
            const region = new Intl.Locale(lang).maximize().region
            if (region && REGION_CURRENCY[region]) return REGION_CURRENCY[region]
        } catch {
            // Malformed language tag: try the next one
        }
    }
    return null
}

export const detectCurrency = (): string => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) return saved
    } catch {
        // Storage blocked: fall through to detection
    }
    return fromTimezone() ?? fromLanguage() ?? 'USD'
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
