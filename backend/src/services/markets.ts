// Registrars that price by country. GoDaddy redirects to the visitor's country site
// from their IP by itself; Hostinger needs the country in the URL. The paths are
// Hostinger's own country sites, from the hreflang list on its pages.
export const GODADDY_SEARCH_URL = 'https://www.godaddy.com/domainsearch/find'

const HOSTINGER_MARKETS: Record<string, string> = {
    AE: 'ae', AR: 'ar', AT: 'at', AU: 'au', BD: 'bd', BE: 'be-nl', BR: 'br', CA: 'ca', CH: 'ch-de', CL: 'es',
    CO: 'co', CZ: 'cz', DE: 'de', DK: 'dk', EC: 'es', EE: 'ee', EG: 'eg', ES: 'es', FI: 'fi', FR: 'fr',
    GB: 'uk', GR: 'gr', HK: 'hk', HR: 'hr', HU: 'hu', ID: 'id', IL: 'il', IN: 'in', IT: 'it', JP: 'jp',
    KR: 'kr', LT: 'lt', LV: 'lv', MA: 'ma', MX: 'mx', MY: 'my', NG: 'ng', NL: 'nl', NO: 'no', PE: 'es',
    PH: 'ph', PK: 'pk', PL: 'pl', PT: 'pt', RO: 'ro', SE: 'se', SK: 'sk', TH: 'th', TR: 'tr', UA: 'ua',
    VN: 'vn',
}

// The US site (no country path) for the US and anywhere Hostinger has no site of its own
export const hostingerSearchUrl = (country: string | null) => {
    const market = country ? HOSTINGER_MARKETS[country] : undefined
    return `https://www.hostinger.com/${market ? `${market}/` : ''}domain-name-results`
}

// Two-letter country code from a query param, or null
export const parseCountry = (value: unknown) =>
    typeof value === 'string' && /^[a-z]{2}$/i.test(value) ? value.toUpperCase() : null
