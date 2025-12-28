// ✅ ✅ (DOES NOT WORK IN HEADLESS)
import { PORKBUN_URL } from "../../config/env.ts";

export const porkbunservice = async(porkbunPage,domain) => {
    try {
        await porkbunPage.bringToFront()
        await porkbunPage.goto(PORKBUN_URL)
    
        await porkbunPage.locator('::-p-aria(Domain Search)').fill(domain);
        await porkbunPage.locator('::-p-aria(submit search)').click();
        console.log('🟢 Porkbun domain entered and searched');
        
        const response = await porkbunPage.waitForResponse(res =>res.url().includes('/api/domains/getChecks'),{ timeout: 30000 });
        console.log('🟢 Porkbun req found');
    
        const raw = await response.json();
        console.log('🟢 Porkbun raw data found');
    
        const exactMatch = raw.results.find(item => item.domain === `${domain}`);

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
    } catch (err) {
        throw{
            registrar: 'Porkbun',
            type: err.name || 'Unknown Error',
            message: err.message || 'Unknown failure'
        }   
    }
}    

// ⚠️⚠️ only works when tab in focus ⚠️⚠️ (keep in mind)