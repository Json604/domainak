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