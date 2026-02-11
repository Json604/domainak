// ✅ ✅ (works with waitUntil only) (DOES NOT WORK IN HEADLESS)
// ⚠️⚠️ returns next available if taken ⚠️⚠️ (keep in mind)
// It is checking availability server side so if returned domain is different from searched then return notAvailable

import { HOSTINGER_URL } from "../../config/env.js";
import type { NativeError, RegistrarResponse } from "../../types/index.ts";

export const hostingerService = async (hostingerPage: any, domain: string): Promise<RegistrarResponse> => {
    try {
        const responsePromise = hostingerPage.waitForResponse((res: any) => res.url().includes("/api/domain/single-domain-search"))

        const timeoutPromise = new Promise(resolve => {
            setTimeout(() => resolve(null),10000)
        })

        console.log('🟣 Hostinger response and timeout promise started');
        
        await hostingerPage.goto(`${HOSTINGER_URL}?domain=${domain}&from=domain-name-search`)
    
        const response = await Promise.race([
            responsePromise,
            timeoutPromise
        ])
        console.log("🟣 Hostinger response and timeout promise resolved");

        if(!response){
            return{
                registrar: 'Hostinger',
                status: 'Unavailable',
                price: null
            }
        }

        const raw = await response.json()

        if(raw.data.result.domain_name !== domain || !raw.data.result.available){
            return {
                registrar: 'Hostinger',
                status: `Unavailable`,
                price: null
            }
        }
        return {
            registrar: 'Hostinger',
            status: raw.data.result.available,
            price: raw.data.result.product.price.purchase
            // price: `$${raw.data.result.product.price.purchase}`
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