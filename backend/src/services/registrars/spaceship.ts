// ✅ ✅ (availability from Spaceship's own WebSocket, price from the DOM) (DOES NOT WORK IN HEADLESS)
import { SPACESHIP_URL } from "../../config/env.js"
import { NO_PRICE, parseDisplayPrice } from "../price.js";
import { sameDomain } from "../domain.js";
import type { NativeError, RegistrarResponse } from "../../types/index.ts";

const PRICE = 'span.main-result__available__prices__text__purchase'
const AFTERMARKET = 'div.main-result__aftermarket__container'

// The page first renders a provisional result (often "unavailable") and corrects it once
// Spaceship's registry check answers over a WebSocket (domains-ws.revved.com):
// {"type":"domainStatusResponse","data":{"name":"example.com","available":false,...}}
// So availability comes from that answer, never from whichever box happens to render first.
const waitForAvailability = async (spaceshipPage: any, domain: string, timeout: number) => {
    const cdp = await spaceshipPage.createCDPSession()
    await cdp.send('Network.enable')
    return new Promise<boolean>((resolve, reject) => {
        const timer = setTimeout(() => reject({ name: 'TimeoutError', message: `Spaceship did not answer within ${timeout / 1000}s` }), timeout)
        cdp.on('Network.webSocketFrameReceived', (e: any) => {
            try {
                const msg = JSON.parse(e.response.payloadData)
                if (msg?.type === 'domainStatusResponse' && sameDomain(msg.data?.name, domain)) {
                    clearTimeout(timer)
                    resolve(msg.data.available === true)
                }
            } catch {
                // Not JSON, or another kind of message
            }
        })
    })
}

// Spaceship's own price list for the domain's ending, as its page loads it (getPrices).
// Used when the page shows "N/A" instead of a purchase price (seen on .com).
const watchListPrice = (spaceshipPage: any, domain: string) => {
    const slug = domain.split('.').slice(1).join('_')
    let amount: number | null = null
    spaceshipPage.on('response', async (res: any) => {
        if (!res.ok() || !res.url().includes('/pricing-bff/price/getPrices')) return
        try {
            const { products } = await res.json()
            const product = products?.find((p: any) => p.product?.productSlug === slug)
            const usd = product?.prices?.find((p: any) => p.priceType === 'purchase')?.total?.USD?.price?.amount
            if (usd && Number.isFinite(Number(usd))) amount = Number(usd)
        } catch {
            // Not the response we need
        }
    })
    return () => amount
}

export const spaceshipService = async (spaceshipPage: any, domain: string):Promise<RegistrarResponse> => {
    try {
        const availability = waitForAvailability(spaceshipPage, domain, 20000)
        availability.catch(() => {})
        const listPrice = watchListPrice(spaceshipPage, domain)

        await spaceshipPage.goto(`${SPACESHIP_URL}?query=${encodeURIComponent(domain)}&tab=domains`)
        console.log('🟤 Entered spaceship page');

        const available = await availability
        console.log('🟤 Spaceship availability answered:', available);

        if(available){
            // The price as the page shows it; failing that, Spaceship's price list for the ending
            const shown = await spaceshipPage.waitForSelector(PRICE, { timeout: 4000 })
                .then(() => spaceshipPage.$eval(PRICE, (e: any) => e.textContent.trim()))
                .catch(() => null)
            const parsed = parseDisplayPrice(shown)
            const fallback = parsed.amount === null ? listPrice() : null
            return{
                registrar: 'Spaceship',
                status: 'Available',
                price: parsed.amount !== null ? shown : fallback !== null ? `$${fallback}` : null,
                ...(parsed.amount !== null ? parsed : fallback !== null ? { amount: fallback, currency: 'USD' } : { amount: null, currency: null })
            }
        }

        // Taken: it may still be listed for sale
        const afterMarketEl = await spaceshipPage.waitForSelector(AFTERMARKET, { timeout: 3000 }).catch(() => null)
        if(afterMarketEl){
            return{
                registrar: 'Spaceship',
                status: 'Available Aftermarket',
                ...NO_PRICE
            }
        }

        return {
            registrar: 'Spaceship',
            status: 'Unavailable',
            ...NO_PRICE
        }


    } catch (error) {
        const err = error as NativeError
        throw{
            registrar: 'Spaceship',
            type: err.name || 'Unknown Error',
            message: err.message || 'Unknown failure'
        }
    }

}
