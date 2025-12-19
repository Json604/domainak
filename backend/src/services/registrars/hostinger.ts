// ✅ ✅ (works with waitUntil only) (DOES NOT WORK IN HEADLESS)

import { HOSTINGER_URL } from "../../config/env.ts";

export const hostingerService = async (hostingerPage, domain) => {
    const responsePromise = hostingerPage.waitForResponse(res => res.url().includes("/api/domain/single-domain-search"), {timeout: 20000})
    console.log('🅗 Hostinger net req promise started');

    await hostingerPage.goto(`${HOSTINGER_URL}?domain=${domain}&from=domain-name-search`,)

    const response = await responsePromise
    console.log("🅗 Hostinger net Req promise resolved");

    const hostingerRes = await response.json()
    console.log('🅗 Hostingerres copied');

    return hostingerRes
}

// ⚠️⚠️ returns next available if taken ⚠️⚠️ (keep in mind)