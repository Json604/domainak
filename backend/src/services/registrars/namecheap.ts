// ✅ ✅ (works with waitUntil only) (DOES NOT WORK IN HEADLESS)    

import { parse } from "tldts";
import { NAMECHEAP_URL } from "../../config/env.ts";

export const namecheapService = async (namecheapPage, domain) => {
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

    let raw = []
    raw.push(responses[2])
    raw.push(responses[0].filter(item => item.Name === tld))
    raw.push(responses[1].domains.find(item => item.name === tld))

    let namecheapRes = {
        registrar: 'Namecheap',
        status: raw[0].status[0].available,
    }
    if(namecheapRes.status === false){
        namecheapRes.price = null
    } else{
        namecheapRes.price = `$${raw[1][0].Pricing.Price}`
    }
 

    console.log(`🟠 NamecheapRes copied`);

    return namecheapRes;
}