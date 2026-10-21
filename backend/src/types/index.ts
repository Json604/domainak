export interface ServiceError {
    success: boolean
    type: string
    message: string
}

export interface NativeError {
    name: string
    message: string
}

export interface RegistrarResponse {
    registrar: string
    status: string | boolean
    // As the registrar shows it, e.g. "₹ 1.00" or "$8.88"
    price: string | number | null
    // Machine-readable version of `price`, for converting between currencies
    amount: number | null
    currency: string | null
    // The registrar's page for this domain, when it differs by country
    url?: string
}
// Progress streamed to the results page while a search runs
export type SearchEvent =
    | { type: 'queued' }
    | { type: 'stage', stage: 'launch' | 'open' }
    | { type: 'phase', registrar: string, phase: 'loading' | 'bot' | 'reading' }
    | { type: 'result', result: { status: 'fulfilled', value: RegistrarResponse } | { status: 'rejected', reason: unknown } }
