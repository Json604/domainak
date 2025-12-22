// ✅ ✅ (DOES NOT WORK IN HEADLESS)
import { PORKBUN_URL } from "../../config/env.ts";

export const porkbunservice = async(porkbunPage,domain) => {
    await porkbunPage.bringToFront()
    await porkbunPage.goto(PORKBUN_URL)

    await porkbunPage.locator('::-p-aria(Domain Search)').fill(domain);
    await porkbunPage.locator('::-p-aria(submit search)').click();
    console.log('🟢 Porkbun domain entered and searched');
    
    const response = await porkbunPage.waitForResponse(res =>res.url().includes('/api/domains/getChecks'),{ timeout: 20000 });
    console.log('🟢 Porkbun req found');

    const raw = await response.json();
    const items = raw.results;
    console.log('🟢 Porkbun raw data found');

    const exactMatch = items.find(item => item.domain === `${domain}`);

    const porkRes = {
        registrar: 'Porkbun',
        status: exactMatch.result
    }
    if(porkRes.status === 'UNAVAILABLE'){
        porkRes.price = null
    } else{
        porkRes.price = `$${(exactMatch.extended.typePricing.registration.price)/100}`
    }

    console.log('🟢 PorkRes copied');

    return porkRes
}    

// ⚠️⚠️ only works when tab in focus ⚠️⚠️ (keep in mind)