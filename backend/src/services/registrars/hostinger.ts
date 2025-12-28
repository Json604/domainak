// ✅ ✅ (works with waitUntil only) (DOES NOT WORK IN HEADLESS)
// ⚠️⚠️ returns next available if taken ⚠️⚠️ (keep in mind)
// It is checking availability server side so if returned domain is different from searched then return notAvailable

import { HOSTINGER_URL } from "../../config/env.ts";

export const hostingerService = async (hostingerPage, domain) => {
    try {
        const responsePromise = hostingerPage.waitForResponse(res => res.url().includes("/api/domain/single-domain-search"), {timeout: 20000})
        console.log('🟣 Hostinger net req promise started');
        
        await hostingerPage.goto(`${HOSTINGER_URL}?domain=${domain}&from=domain-name-search`)
    
        const response = await responsePromise
        console.log("🟣 Hostinger net Req promise resolved");
        console.log(response);

        if(response){
            const raw = await response.json()
            console.log(raw);
    
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
        }
        return{
            registrar: 'Hostinger',
            status: 'Unavailable',
            price: null
        }
    } catch (err) {
        throw{
            registrar: 'Hostinger',
            type: err.name || 'Unknown Error',
            message: err.message || 'Unknown failure'
        }
    }
}