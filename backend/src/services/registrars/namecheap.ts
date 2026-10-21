// ✅ ✅ (works with waitUntil only) (DOES NOT WORK IN HEADLESS)    

import { parse } from "tldts";
import { NAMECHEAP_URL } from "../../config/env.js";
import { NO_PRICE } from "../price.js";
import type { NativeError, RegistrarResponse } from "../../types/index.ts";

export const namecheapService = async (namecheapPage: any, domain: string): Promise<RegistrarResponse> => {
    try {
        const tld = parse(domain, {allowPrivateDomains: true}).publicSuffix
    
        const ReqPromises = [
            namecheapPage.waitForResponse((res: any) => res.ok() && res.url().includes("/domains/tlds.ashx")),
            namecheapPage.waitForResponse((res: any) => res.ok() && res.url().startsWith("https://rtb.namecheap.com/api/domains?")),
            namecheapPage.waitForResponse((res: any) => res.ok() && res.url().startsWith("https://domain-search.namecheap.com/v1/domainStatus?"))
        ]
        console.log(`🟠 Namecheap net req promise started`);
    
        await namecheapPage.goto(`${NAMECHEAP_URL}?domain=${encodeURIComponent(domain)}`)
    
        const responsePromise = await Promise.all(ReqPromises)
        console.log(`🟠 Namecheap net Req Promise resolved`);
    
        const responses = await Promise.all(responsePromise.map(res => res.json()))
        console.log(`🟠 NamecheapRes net Res Promise array reolved`);
    
        let raw = []
        raw.push(responses[0].filter((item: any) => item.Name === tld))
        raw.push(responses[1].domains.find((item: any) => item.name === tld))
        raw.push(responses[2])
    
        if(!raw[1]){
            return{
                registrar: 'Namecheap',
                status: 'Unavailable',
                ...NO_PRICE
            }
        }

        let namecheapRes: RegistrarResponse = {
            registrar: 'Namecheap',
            status: raw[2].status[0].available,
            ...NO_PRICE
        }
        if(namecheapRes.status === false){
            namecheapRes.price = null
        } else{
            namecheapRes.price = `$${raw[0][0].Pricing.Price}`
            namecheapRes.amount = Number(raw[0][0].Pricing.Price)
            namecheapRes.currency = 'USD'
        }
     
        console.log(`🟠 NamecheapRes copied`);
    
        return namecheapRes;
    } catch (error) {
        const err = error as NativeError
        throw{
            registrar: 'Namecheap',
            type: err.name || 'Unknown Error',
            message: err.message || 'Unknown failure'
        }
    }
}