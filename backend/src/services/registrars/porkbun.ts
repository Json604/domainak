// ✅ ✅ (DOES NOT WORK IN HEADLESS)
import { NO_PRICE } from "../price.js";
import { sameDomain } from "../domain.js";
import type { NativeError, RegistrarResponse } from "../../types/index.ts";

// Porkbun's results page (the one Register links to). Opening it directly is ~3x faster
// than typing into the search box, and has fewer steps to time out on a busy machine.
const PORKBUN_SEARCH_URL = 'https://porkbun.com/checkout/search'

export const porkbunservice = async(porkbunPage: any,domain: string): Promise<RegistrarResponse> => {
    try {
        const responsePromise = porkbunPage.waitForResponse((res: any) =>res.ok() && res.url().includes('/api/domains/getChecks'),{ timeout: 30000 });
        await porkbunPage.goto(`${PORKBUN_SEARCH_URL}?q=${encodeURIComponent(domain)}`)
        console.log('🟢 Porkbun results page opened');

        const response = await responsePromise
        console.log('🟢 Porkbun req found');
    
        const raw = await response.json();
        console.log('🟢 Porkbun raw data found');
    
        const exactMatch = raw.results.find((item: any) => sameDomain(item.domain, domain));

        if(exactMatch && exactMatch.result === 'AVAILABLE'){
            return{
                registrar: 'Porkbun',
                status: exactMatch.result,
                price: `$${(exactMatch.extended.typePricing.registration.price)/100}`,
                amount: exactMatch.extended.typePricing.registration.price / 100,
                currency: 'USD'
            }
        }

        return{
            registrar: 'Porkbun',
            status: 'Unavailable',
            ...NO_PRICE
        }    
    } catch (error) {
        const err = error as NativeError
        throw{
            registrar: 'Porkbun',
            type: err.name || 'Unknown Error',
            message: err.message || 'Unknown failure'
        }   
    }
}    

// ⚠️⚠️ only works when tab in focus ⚠️⚠️ (keep in mind)
// Focus is emulated in browser.ts, so it works in the minimized window without bringToFront()