import { parse } from 'tldts'

// Reads a search like the backend does: "WWW.Example.COM", "https://example.com/about"
// and "example.com." all mean "example.com". Real domain endings only (no IPs or
// made-up TLDs). `domain` is what registrars can sell; `host` keeps any other
// subdomain that was typed (minus "www."), so "lanternharbor58.ex.uk" is flagged
// instead of being silently searched as "ex.uk".
export const readDomain = (raw: string | null | undefined) => {
    if (!raw) return null
    const { domain, hostname, isIcann, isIp } = parse(raw.trim())
    if (!domain || !hostname || !isIcann || isIp) return null
    const host = hostname.replace(/^www\./, '')
    return { domain, host, isSubdomain: host !== domain }
}
