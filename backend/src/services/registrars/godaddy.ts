// (DOES NOT WORK IN HEADLESS)
import { GODADDY_URL } from "../../config/env.js";
import type { NativeError, RegistrarResponse } from "../../types/index.ts";

export const godaddyService = async (godaddyPage: any, domain:any): Promise<RegistrarResponse> => {
    try {
        const responsePromise = godaddyPage.waitForResponse((res: any) => res.url().startsWith('https://www.godaddy.com/en-in/domainfind/v1/search/exact?search_guid'),{timeout: 20000});
        console.log('⚪️ Godaddy network Req Promise started');
    
        await godaddyPage.goto(`${GODADDY_URL}?domainToCheck=${domain}`)

        await godaddyPage.screenshot({path:'godaddy-debug.png', fullPage: true })

        const html = await godaddyPage.content()
        console.log('🔍 Page HTML:', html.substring(0, 2000))  // First 2000 chars
        const title = await godaddyPage.title()
        console.log('🔍 Page title:', title)
        // If it says "Access Denied" or "Captcha", you're being blocked


        
        const response = await responsePromise;
        console.log('⚪️ Godaddy network Req promise resolved');
        
        const raw = await response.json()
        
        if(raw.ExactMatchDomain.IsAvailable && raw.ExactMatchDomain.Fqdn === domain){
            return{
                registrar: 'Godaddy',
                status: 'Available',
                price: raw.CurrentPriceDisplay
            }
        } if(!raw.ExactMatchDomain.IsAvailable && raw.ExactMatchDomain.Fqdn === domain && raw.ExactMatchDomain.AftermarketMinPriceDisplay){
            return{
                registrar: 'Godaddy',
                status: 'Available Aftermarket',
                price: raw.ExactMatchDomain.AftermarketMinPriceDisplay
            }
        }
        
        return{
            registrar: 'Godaddy',
            status: 'Unavailable',
            price: null
        }
    } catch (error) {
        const err = error as NativeError
        await godaddyPage.screenshot({path:'godaddy-debug.png', fullPage: true })
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