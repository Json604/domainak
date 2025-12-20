// ✅ ✅ (works with waitUntil only) (DOES NOT WORK IN HEADLESS)
// ⚠️⚠️ returns next available if taken ⚠️⚠️ (keep in mind)
// It is checking availability server side so if returned domain is different from searched then return notAvailable

import { HOSTINGER_URL } from "../../config/env.ts";

export const hostingerService = async (hostingerPage, domain) => {
    const responsePromise = hostingerPage.waitForResponse(res => res.url().includes("/api/domain/single-domain-search"), {timeout: 20000})
    console.log('🟣 Hostinger net req promise started');

    await hostingerPage.goto(`${HOSTINGER_URL}?domain=${domain}&from=domain-name-search`,)

    const response = await responsePromise
    console.log("🟣 Hostinger net Req promise resolved");

    let hostingerRes = await response.json()
    if(hostingerRes.data.result.domain_name !== domain){
        hostingerRes = `Domain Unavailable on hostinger.`
    }
    console.log('🟣 HostingerRes copied');

    return hostingerRes
}