import type { Registrar } from '../types'

// Shared by the staged demo and the live search story

export const REGISTRARS: { name: Registrar, label: string, site: string }[] = [
    { name: 'Godaddy', label: 'GoDaddy', site: 'godaddy.com/domainsearch/find?domainToCheck=' },
    { name: 'Namecheap', label: 'Namecheap', site: 'namecheap.com/domains/registration/results/?domain=' },
    { name: 'Porkbun', label: 'Porkbun', site: 'porkbun.com/checkout/search?q=' },
    { name: 'Dynadot', label: 'Dynadot', site: 'dynadot.com/domain/search?domain=' },
    { name: 'Hostinger', label: 'Hostinger', site: 'hostinger.com/domain-name-results?domain=' },
    { name: 'Spaceship', label: 'Spaceship', site: 'spaceship.com/domain-search/?query=' },
]

export const STEP_LABELS = ['Launch Chrome', 'Open registrars', 'Bot checks', 'Read prices', 'Compare']

export type Phase = 'hidden' | 'loading' | 'bot' | 'reading' | 'done' | 'taken' | 'failed'

export const EASE_OUT = [0.23, 1, 0.32, 1] as const
