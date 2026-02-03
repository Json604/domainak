import { connect } from "puppeteer-real-browser";
import { dynaService } from "./registrars/dynadot.ts";
import { godaddyService } from "./registrars/godaddy.ts";
import { porkbunservice } from "./registrars/porkbun.ts";
import { hostingerService } from "./registrars/hostinger.ts";
import { spaceshipService } from "./registrars/spaceship.ts";
import { namecheapService } from "./registrars/namecheap.ts";

export const searchService = async(domain) => {
    try {
        const { browser} = await connect({
            headless: false,
            args: [],
            customConfig: {},
            turnstile: true,
            connectOption: {},
            disableXvfb: false,
            ignoreAllFlags: false,
            // proxy:{
            //     host:'<proxy-host>',
            //     port:'<proxy-port>',
            //     username:'<proxy-username>',
            //     password:'<proxy-password>'
            // }
        });
        const context = await browser.createBrowserContext()

        // console.log('Beginning Primary availability check');
        
        // // ⚠️ Primary availability check ⚠️
        // const primaryCheck = await Promise.allSettled([godaddyService(godaddyPage, domain)]) 
        // console.log('Primary check resloved');
        
        // if((primaryCheck[0]?.value?.status.toLowerCase() === 'taken')){
            //     return 'This domain is already taken.'
        // }
        
        const godaddyPage = await context.newPage()
        const dynaPage = await context.newPage()
        const porkbunPage = await context.newPage()
        const hostingerPage = await context.newPage()
        const namecheapPage = await context.newPage()
        const spaceshipPage = await context.newPage()

        console.log('Parallel scraping started');

        const secondaryPromises = await Promise.allSettled([
            godaddyService(godaddyPage, domain),
            dynaService(dynaPage, domain),
            porkbunservice(porkbunPage, domain),
            hostingerService(hostingerPage, domain),
            namecheapService(namecheapPage, domain),
            spaceshipService(spaceshipPage, domain),
        ])

        console.log('Promises resolved, returning combined data...');

        return{
            domain,
            result: [
                // ...primaryCheck,
                ...secondaryPromises
            ]
        };
    } catch (error) {
        throw{
            success: false,
            type: error.type,
            message: error.message,
        }
    }
}