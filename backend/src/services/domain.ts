import { domainToASCII } from "node:url";
import { parse } from "tldts";

// What the registrars can actually sell, from whatever was typed:
// "www.Example.COM", "https://example.com/about" and "example.com." all mean
// "example.com". Real domain endings only (no IPs, no made-up TLDs).
// `host` keeps any other subdomain (minus "www."): "blog.example.com" is not
// quietly searched as "example.com".
export const readDomain = (raw: unknown) => {
    if (typeof raw !== 'string') return null
    const { domain, hostname, isIcann, isIp } = parse(raw.trim())
    if (!domain || !hostname || !isIcann || isIp) return null
    const host = hostname.replace(/^www\./, '')
    return { domain, host, isSubdomain: host !== domain }
}

// The domain to search, or why it can't be searched
export const checkDomain = (raw: unknown): { domain: string } | { message: string } => {
    const read = readDomain(raw)
    if (!read) return { message: 'Please enter a valid domain name, like example.com.' }
    if (read.isSubdomain) {
        return { message: `${read.host} can't be registered on its own: it's a subdomain of ${read.domain}. Check it for a typo, or search ${read.domain}.` }
    }
    return { domain: read.domain }
}

// Registrars answer in different forms: some lowercase, some in punycode
// ("xn--bcher-kva.de") for an international domain typed as "bücher.de"
export const sameDomain = (a: unknown, b: unknown) =>
    typeof a === 'string' && typeof b === 'string' &&
    domainToASCII(a.toLowerCase()) === domainToASCII(b.toLowerCase())
