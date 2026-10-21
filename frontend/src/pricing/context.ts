import { createContext, useContext } from 'react'
import { priceView, type PriceView, type Rates } from './currency'
import type { RegistrarResult } from '../types'

export interface Pricing {
    currency: string
    setCurrency: (currency: string) => void
    rates: Rates | null
    updatedAt: string | null
    view: (value: RegistrarResult) => PriceView
}

// Outside a provider, prices show as the registrar gave them
const fallback: Pricing = {
    currency: 'USD',
    setCurrency: () => {},
    rates: null,
    updatedAt: null,
    view: (value) => priceView(value, 'USD', null),
}

export const PricingContext = createContext<Pricing>(fallback)

export const usePricing = () => useContext(PricingContext)
