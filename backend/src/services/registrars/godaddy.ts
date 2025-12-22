// ✅ ❌ ✅(works without waituntil + waitForNetworkIdle only) (didnt work on College's network) (DOES NOT WORK IN HEADLESS)
import { GODADDY_URL } from "../../config/env.ts";

export const godaddyService = async (godaddyPage, domain) => {
    const responsePromise = godaddyPage.waitForResponse(res => res.url().startsWith('https://www.godaddy.com/en-in/domainfind/v1/search/exact?search_guid'),{timeout: 20000});
    console.log('⚪️ Godaddy network Req Promise started');

    await godaddyPage.goto(`${GODADDY_URL}?domainToCheck=${domain}`)

    const response = await responsePromise;
    console.log('⚪️ Godaddy network Req promise resolved');
    
    const raw = await response.json()
    
    let godaddyRes = {}
    godaddyRes.registrar = 'Godaddy'
    godaddyRes.status = raw.ExactMatchDomain.AvailabilityLabel

    if(godaddyRes.status === 'taken'){
        godaddyRes.price = null
    } else{
        const product = raw.Products[0];
        godaddyRes.price = product.PriceInfo.CurrentPriceDisplay
    }

    console.log('⚪️ GodaddyRes copied');

    return godaddyRes
}