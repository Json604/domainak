import { useMemo } from 'react'
import { usePricing } from '../pricing/context'
import { PICKER_CURRENCIES } from '../pricing/currency'

const CurrencyPicker = () => {
    const { currency, setCurrency, rates } = usePricing()

    const options = useMemo(() => {
        const names = new Intl.DisplayNames(undefined, { type: 'currency' })
        const codes = PICKER_CURRENCIES.filter((code) => !rates || rates[code])
        if (!codes.includes(currency)) codes.unshift(currency)
        return codes.map((code) => ({ code, label: `${code} · ${names.of(code) ?? code}` }))
    }, [rates, currency])

    return (
        <label className="currency-picker">
            Prices in
            <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                {options.map((o) => <option key={o.code} value={o.code}>{o.label}</option>)}
            </select>
        </label>
    )
}

// Says prices are converted, and credits the rates source (its terms ask for it)
export const RatesNote = () => {
    const { rates, updatedAt } = usePricing()
    if (!rates) return null
    const date = updatedAt ? new Date(updatedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) : null
    return (
        <p className="rates-note">
            ≈ prices are converted at daily exchange rates{date ? ` (${date})` : ''}. You pay in the registrar’s own currency.{' '}
            <a href="https://www.exchangerate-api.com" target="_blank" rel="noopener noreferrer">Rates By Exchange Rate API</a>
        </p>
    )
}

export default CurrencyPicker
