// ✅ ✅ (DOES NOT WORK IN HEADLESS)
import { PORKBUN_URL } from "../../config/env.ts";

export const porkbunservice = async(porkbunPage,domain) => {
    await porkbunPage.goto(PORKBUN_URL)

    await porkbunPage.locator('::-p-aria(Domain Search)').fill(domain);
    await porkbunPage.locator('::-p-aria(submit search)').click();
    console.log('🅟 Porkbun domain entered and searched');
    
    const response = await porkbunPage.waitForResponse(res =>res.url().includes('/api/domains/getChecks'),{ timeout: 20000 });
    console.log('🅟 Porkbun req found');

    const data = await response.json();
    const items = data.results;
    console.log('🅟 Porkbun raw data found');

    const porkRes = items.find(item => item.domain === `${domain}`);
    console.log('🅟 porkRes copied');

    return porkRes
}    