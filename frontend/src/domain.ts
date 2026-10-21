import { parse } from 'tldts'

// Same rules as the backend: "www.Example.COM", "https://example.com/about" and
// "example.com." all become "example.com". Real domain endings only (no IPs or
// made-up TLDs). Registrars compare exact domains, so anything else gives wrong answers.
export const normalizeDomain = (raw: string | null | undefined) => {
    if (!raw) return null
    const { domain, isIcann, isIp } = parse(raw.trim())
    return domain && isIcann && !isIp ? domain : null
}
