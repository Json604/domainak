// ✅ ✅ (DOES NOT WORK IN HEADLESS)
import { PORKBUN_URL } from "../../config/env.js";
import type { NativeError, RegistrarResponse } from "../../types/index.ts";

export const porkbunservice = async(porkbunPage: any,domain: string): Promise<RegistrarResponse> => {
    try {
        await porkbunPage.bringToFront()
        await porkbunPage.goto(PORKBUN_URL)
    
        await porkbunPage.locator('::-p-aria(Domain Search)').fill(domain);
        await porkbunPage.locator('::-p-aria(submit search)').click();
        console.log('🟢 Porkbun domain entered and searched');
        
        const response = await porkbunPage.waitForResponse((res: any) =>res.url().includes('/api/domains/getChecks'),{ timeout: 30000 });
        console.log('🟢 Porkbun req found');
    
        const raw = await response.json();
        console.log('🟢 Porkbun raw data found');
    
        const exactMatch = raw.results.find((item: any) => item.domain === `${domain}`);

        if(exactMatch && exactMatch.result === 'AVAILABLE'){
            return{
                registrar: 'Porkbun',
                status: exactMatch.result,
                price: `$${(exactMatch.extended.typePricing.registration.price)/100}`
            }
        }

        return{
            registrar: 'Porkbun',
            status: 'Unavailable',
            price: null
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