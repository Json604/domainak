import { domainToASCII } from "node:url";
import { parse } from "tldts";

// What the registrars can actually sell, from whatever was typed:
// "www.Example.COM", "https://example.com/about" and "example.com." all mean
// "example.com". Real domain endings only (no IPs, no made-up TLDs).
export const normalizeDomain = (raw: unknown) => {
    if (typeof raw !== 'string') return null
    const { domain, isIcann, isIp } = parse(raw.trim())
    return domain && isIcann && !isIp ? domain : null
}

// Registrars answer in different forms: some lowercase, some in punycode
// ("xn--bcher-kva.de") for an international domain typed as "bücher.de"
export const sameDomain = (a: unknown, b: unknown) =>
    typeof a === 'string' && typeof b === 'string' &&
    domainToASCII(a.toLowerCase()) === domainToASCII(b.toLowerCase())
