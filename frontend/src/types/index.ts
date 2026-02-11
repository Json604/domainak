export type Registrar = 'Godaddy' | 'Namecheap' | 'Porkbun' | 'Dynadot' | 'Hostinger' | 'Spaceship'

export interface RegistrarResult{
    registrar: Registrar
    status: string | boolean
    price: string | number | null
}

export interface RegistrarError{
    registrar: Registrar
    type: string
    message: string
}

export type PromiseResult = {status: 'fulfilled'; value: RegistrarResult} | {status: 'rejected'; reason: RegistrarError}