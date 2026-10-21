// (DOES NOT WORK IN HEADLESS)
import { GODADDY_SEARCH_URL } from "../markets.js";
import { NO_PRICE, parseDisplayPrice } from "../price.js";
import { sameDomain } from "../domain.js";
import type { NativeError, RegistrarResponse } from "../../types/index.ts";

export const godaddyService = async (godaddyPage: any, domain:any): Promise<RegistrarResponse> => {
    try {
        const responsePromise = godaddyPage.waitForResponse((res: any) => res.ok() && res.url().includes('/domainfind/v1/search/exact?search_guid'),{timeout: 20000});
        console.log('⚪️ Godaddy network Req Promise started');
    
        // GoDaddy redirects to the visitor's country site (e.g. /en-in) by itself
        await godaddyPage.goto(`${GODADDY_SEARCH_URL}?domainToCheck=${encodeURIComponent(domain)}`)

        const response = await responsePromise;
        console.log('⚪️ Godaddy network Req promise resolved');
        
        const raw = await response.json()
        // The market's currency, e.g. "INR"; "$" alone can't tell USD from CAD or AUD
        const priced = (display: string) => {
            const parsed = parseDisplayPrice(display)
            return { ...parsed, currency: parsed.amount === null ? null : raw.ClientRequestIn?.Currency ?? parsed.currency }
        }
        
        if(raw.ExactMatchDomain.IsAvailable && sameDomain(raw.ExactMatchDomain.Fqdn, domain)){
            return{
                registrar: 'Godaddy',
                status: 'Available',
                price: raw.CurrentPriceDisplay,
                ...priced(raw.CurrentPriceDisplay)
            }
        } if(!raw.ExactMatchDomain.IsAvailable && sameDomain(raw.ExactMatchDomain.Fqdn, domain) && raw.ExactMatchDomain.AftermarketMinPriceDisplay){
            return{
                registrar: 'Godaddy',
                status: 'Available Aftermarket',
                price: raw.ExactMatchDomain.AftermarketMinPriceDisplay,
                ...priced(raw.ExactMatchDomain.AftermarketMinPriceDisplay)
            }
        }
        
        return{
            registrar: 'Godaddy',
            status: 'Unavailable',
            ...NO_PRICE
        }
    } catch (error) {
        const err = error as NativeError
        throw{
            registrar: 'Godaddy',
            type: err.name || 'Unknown Error',
            message: err.message || 'Unknown failure'
        }
        
    }
}

// Primary availability check 1
// export const godaddyAvailabilityCheck = (raw) => {
//     return raw.ExactMatchDomain.AvailabilityLabel?.toLowerCase()
// }


// crypto.zi
// crypto.ai
// raptor.com
// ajdng.adkjga
// aften.it.com
// adnfjald.akjdnf.jafn