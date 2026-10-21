// Where the visitor is, from the browser alone (no network, no permission prompt):
// the timezone first, since it follows the machine; then the region in their language.
// Used to pick registrars' country sites and the currency prices are shown in.

const TIMEZONE_COUNTRY: Record<string, string> = {
    'Asia/Kolkata': 'IN', 'Asia/Calcutta': 'IN',
    'Europe/London': 'GB', 'Europe/Dublin': 'IE', 'Europe/Zurich': 'CH', 'Europe/Stockholm': 'SE', 'Europe/Oslo': 'NO',
    'Europe/Copenhagen': 'DK', 'Europe/Warsaw': 'PL', 'Europe/Prague': 'CZ', 'Europe/Budapest': 'HU',
    'Europe/Bucharest': 'RO', 'Europe/Istanbul': 'TR', 'Europe/Kyiv': 'UA', 'Europe/Kiev': 'UA', 'Europe/Moscow': 'RU',
    'Europe/Berlin': 'DE', 'Europe/Paris': 'FR', 'Europe/Madrid': 'ES', 'Atlantic/Canary': 'ES', 'Europe/Rome': 'IT',
    'Europe/Amsterdam': 'NL', 'Europe/Brussels': 'BE', 'Europe/Vienna': 'AT', 'Europe/Lisbon': 'PT',
    'Europe/Helsinki': 'FI', 'Europe/Athens': 'GR', 'Europe/Luxembourg': 'LU', 'Europe/Bratislava': 'SK',
    'Europe/Ljubljana': 'SI', 'Europe/Tallinn': 'EE', 'Europe/Riga': 'LV', 'Europe/Vilnius': 'LT',
    'Europe/Zagreb': 'HR', 'Europe/Malta': 'MT', 'Asia/Nicosia': 'CY',
    'Asia/Tokyo': 'JP', 'Asia/Seoul': 'KR', 'Asia/Shanghai': 'CN', 'Asia/Hong_Kong': 'HK', 'Asia/Taipei': 'TW',
    'Asia/Singapore': 'SG', 'Asia/Kuala_Lumpur': 'MY', 'Asia/Jakarta': 'ID', 'Asia/Manila': 'PH',
    'Asia/Bangkok': 'TH', 'Asia/Ho_Chi_Minh': 'VN', 'Asia/Saigon': 'VN', 'Asia/Dubai': 'AE', 'Asia/Riyadh': 'SA',
    'Asia/Qatar': 'QA', 'Asia/Jerusalem': 'IL', 'Asia/Karachi': 'PK', 'Asia/Dhaka': 'BD',
    'Asia/Kathmandu': 'NP', 'Asia/Katmandu': 'NP', 'Asia/Colombo': 'LK',
    'Pacific/Auckland': 'NZ', 'Pacific/Honolulu': 'US',
    'America/New_York': 'US', 'America/Chicago': 'US', 'America/Denver': 'US', 'America/Los_Angeles': 'US',
    'America/Phoenix': 'US', 'America/Anchorage': 'US', 'America/Detroit': 'US', 'America/Boise': 'US',
    'America/Toronto': 'CA', 'America/Vancouver': 'CA', 'America/Edmonton': 'CA', 'America/Winnipeg': 'CA',
    'America/Halifax': 'CA', 'America/Regina': 'CA', 'America/St_Johns': 'CA',
    'America/Sao_Paulo': 'BR', 'America/Mexico_City': 'MX', 'America/Bogota': 'CO', 'America/Lima': 'PE',
    'America/Santiago': 'CL', 'Africa/Lagos': 'NG', 'Africa/Johannesburg': 'ZA', 'Africa/Nairobi': 'KE',
    'Africa/Cairo': 'EG', 'Africa/Casablanca': 'MA',
}
const TIMEZONE_PREFIX_COUNTRY: [string, string][] = [
    ['Australia/', 'AU'], ['America/Argentina/', 'AR'], ['America/Indiana/', 'US'], ['America/Kentucky/', 'US'],
]

export const COUNTRY_CURRENCY: Record<string, string> = {
    US: 'USD', IN: 'INR', GB: 'GBP', CA: 'CAD', AU: 'AUD', NZ: 'NZD', CH: 'CHF', SE: 'SEK', NO: 'NOK', DK: 'DKK',
    PL: 'PLN', CZ: 'CZK', HU: 'HUF', RO: 'RON', TR: 'TRY', UA: 'UAH', RU: 'RUB', JP: 'JPY', KR: 'KRW', CN: 'CNY',
    HK: 'HKD', TW: 'TWD', SG: 'SGD', MY: 'MYR', ID: 'IDR', PH: 'PHP', TH: 'THB', VN: 'VND', AE: 'AED', SA: 'SAR',
    QA: 'QAR', IL: 'ILS', PK: 'PKR', BD: 'BDT', NP: 'NPR', LK: 'LKR', BR: 'BRL', MX: 'MXN', AR: 'ARS', CO: 'COP',
    CL: 'CLP', PE: 'PEN', NG: 'NGN', ZA: 'ZAR', KE: 'KES', EG: 'EGP', MA: 'MAD',
    DE: 'EUR', FR: 'EUR', ES: 'EUR', IT: 'EUR', NL: 'EUR', BE: 'EUR', AT: 'EUR', IE: 'EUR', PT: 'EUR', FI: 'EUR',
    GR: 'EUR', LU: 'EUR', SK: 'EUR', SI: 'EUR', EE: 'EUR', LV: 'EUR', LT: 'EUR', HR: 'EUR', MT: 'EUR', CY: 'EUR',
}

const fromTimezone = () => {
    try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
        return TIMEZONE_COUNTRY[tz] ?? TIMEZONE_PREFIX_COUNTRY.find(([prefix]) => tz.startsWith(prefix))?.[1] ?? null
    } catch {
        return null
    }
}

const fromLanguage = () => {
    for (const lang of navigator.languages ?? [navigator.language]) {
        try {
            const region = new Intl.Locale(lang).maximize().region
            if (region && COUNTRY_CURRENCY[region]) return region
        } catch {
            // Malformed language tag: try the next one
        }
    }
    return null
}

// ISO country code like "IN", or null when the browser gives nothing to go on
export const detectCountry = (): string | null => fromTimezone() ?? fromLanguage()
