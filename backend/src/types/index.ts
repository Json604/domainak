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
    price: string | number | null
}
// Progress streamed to the results page while a search runs
export type SearchEvent =
    | { type: 'queued' }
    | { type: 'stage', stage: 'launch' | 'open' }
    | { type: 'phase', registrar: string, phase: 'loading' | 'bot' | 'reading' }
    | { type: 'result', result: { status: 'fulfilled', value: RegistrarResponse } | { status: 'rejected', reason: unknown } }
