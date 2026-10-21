// ✅ ✅ (works with waitUntil only) (DOES NOT WORK IN HEADLESS)
// ⚠️⚠️ returns next available if taken ⚠️⚠️ (keep in mind)
// It is checking availability server side so if returned domain is different from searched then return notAvailable

import { hostingerSearchUrl } from "../markets.js";
import { NO_PRICE } from "../price.js";
import type { NativeError, RegistrarResponse } from "../../types/index.ts";

// `country` picks Hostinger's site for the visitor's country, so prices are local
export const hostingerService = async (hostingerPage: any, domain: string, country: string | null = null): Promise<RegistrarResponse> => {
    try {
        const responsePromise = hostingerPage.waitForResponse((res: any) => res.url().includes("/api/domain/single-domain-search"))

        const timeoutPromise = new Promise(resolve => {
            setTimeout(() => resolve(null),20000)
        })

        console.log('🟣 Hostinger response and timeout promise started');
        
        await hostingerPage.goto(`${hostingerSearchUrl(country)}?domain=${domain}&from=domain-name-search`)
    
        const response = await Promise.race([
            responsePromise,
            timeoutPromise
        ])
        console.log("🟣 Hostinger response and timeout promise resolved");

        // No answer isn't the same as "taken" (Hostinger answers for taken domains too)
        if(!response){
            throw { name: 'TimeoutError', message: 'Hostinger did not answer within 20s' }
        }

        const raw = await response.json()

        if(raw.data.result.domain_name !== domain || !raw.data.result.available){
            return {
                registrar: 'Hostinger',
                status: `Unavailable`,
                ...NO_PRICE
            }
        }
        return {
            registrar: 'Hostinger',
            status: raw.data.result.available,
            price: raw.data.result.product.price.purchase,
            // price: `$${raw.data.result.product.price.purchase}`
            amount: raw.data.result.product.price.purchase,
            currency: raw.data.result.product.price.currency_code ?? null
        }
    } catch (error) {
        const err = error as NativeError
        throw{
            registrar: 'Hostinger',
            type: err.name || 'Unknown Error',
            message: err.message || 'Unknown failure'
        }
    }
}