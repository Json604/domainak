import { connect } from "puppeteer-real-browser";
import { dynaService } from "./registrars/dynadot.ts";
import { godaddyService } from "./registrars/godaddy.ts";
import { porkbunservice } from "./registrars/porkbun.ts";
import { hostingerService } from "./registrars/hostinger.ts";
import { spaceshipService } from "./registrars/spaceship.ts";
import { namecheapService } from "./registrars/namecheap.ts";

export const searchService = async(domain) => {
    let browser = null
    try {
        const connection = await connect({
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
        browser = connection.browser
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

        await browser.close()
        console.log('🟢 Browser closed successfully');

        return{
            domain,
            result: [
                // ...primaryCheck,
                ...secondaryPromises
            ]
        };
    } catch (error) {
        console.error('🔴 Search service error:', error.message);
        if (browser) {
            try {
                await browser.close()
                console.log('🟡 Browser closed after error');
            } catch (closeErr) {
                console.error('🔴 Failed to close browser:', closeErr.message);
            }
        }
        throw{
            success: false,
            type: error.name || 'UnknownError',
            message: error.message || 'Failed to search domain',
        }
    }
}