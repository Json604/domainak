// ✅ ❌ ✅(works without waituntil + waitForNetworkIdle only) (didnt work on College's network) (DOES NOT WORK IN HEADLESS)
import { GODADDY_URL } from "../../config/env.ts";

export const godaddyService = async (godaddyPage, domain) => {
    const responsePromise = godaddyPage.waitForResponse(res => res.url().startsWith('https://www.godaddy.com/en-in/domainfind/v1/search/exact?search_guid'),{timeout: 20000});
    console.log('🅖 Godaddy network Req Promise started');

    await godaddyPage.goto(`${GODADDY_URL}?domainToCheck=${domain}`)

    const response = await responsePromise;
    console.log('🅖 Godaddy network Req promise resolved');
    console.log("🅖 copying godaddy data");
    const godaddyRes = await response.json()
    console.log('🅖 GodaddyRes copied');

    return godaddyRes
}