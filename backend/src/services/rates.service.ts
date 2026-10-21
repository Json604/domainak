// Daily exchange rates (units per 1 USD) for showing prices in the user's currency.
// Free, keyless endpoint; its terms ask for attribution, which the results page shows.
const RATES_URL = 'https://open.er-api.com/v6/latest/USD'
const TTL_MS = 12 * 60 * 60 * 1000

let cached: { at: number, data: { base: 'USD', rates: Record<string, number>, updatedAt: string } } | null = null

export const ratesService = async () => {
    if (cached && Date.now() - cached.at < TTL_MS) return cached.data

    const res = await fetch(RATES_URL)
    const json = await res.json() as { result: string, rates: Record<string, number>, time_last_update_utc: string }
    if (json.result !== 'success') throw new Error('Exchange rates unavailable')

    cached = { at: Date.now(), data: { base: 'USD', rates: json.rates, updatedAt: json.time_last_update_utc } }
    return cached.data
}
