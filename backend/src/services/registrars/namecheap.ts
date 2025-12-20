// ✅ ✅ (works with waitUntil only) (DOES NOT WORK IN HEADLESS)    

import { parse } from "tldts";
import { NAMECHEAP_URL } from "../../config/env.ts";

export const namecheapService = async (namecheapPage, domain) => {
    let namecheapRes = []
    const tld = parse(domain, {allowPrivateDomains: true}).publicSuffix

    const ReqPromises = [
        namecheapPage.waitForResponse(res => res.url().includes("/domains/tlds.ashx")),
        namecheapPage.waitForResponse(res => res.url().startsWith("https://rtb.namecheapapi.com/api/domains")),
        namecheapPage.waitForResponse(res => res.url().startsWith("https://domains.revved.com/v1/domainStatus?domains"))
    ]
    console.log(`🟠 Namecheap net req promise started`);

    await namecheapPage.goto(`${NAMECHEAP_URL}?domain=${domain}`)

    const responsePromise = await Promise.all(ReqPromises)
    console.log(`🟠 Namecheap net Req Promise resolved`);

    const responses = await Promise.all(responsePromise.map(res => res.json()))
    console.log(`🟠 NamecheapRes net Res Promise array reolved`);

    namecheapRes.push(responses[2])
    namecheapRes.push(responses[0].filter(item => item.Name === tld))
    namecheapRes.push(responses[1].domains.find(item => item.name === tld))
    console.log(`🟠 NamecheapRes copied`);

    return namecheapRes;
}