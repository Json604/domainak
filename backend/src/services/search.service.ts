import { connect } from "puppeteer-real-browser";
import { dynaService } from "./registrars/dynadot.ts";
import { godaddyService } from "./registrars/godaddy.ts";
import { porkbunservice } from "./registrars/porkbun.ts";
import { hostingerService } from "./registrars/hostinger.ts";

export const searchService = async(domain) => {
    let combinedRes = []

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

    const dynaPage = await context.newPage()
    const godaddyPage = await context.newPage()
    const porkbunPage = await context.newPage()
    const hostingerPage = await context.newPage()

    console.log('Regsitrar pages created');

    console.log('Parallel scraping started');
    const Promises = [
        dynaService(dynaPage, domain),
        godaddyService(godaddyPage, domain),
        porkbunservice(porkbunPage,domain),
        hostingerService(hostingerPage, domain)
    ]

    const result = await Promise.all(Promises)
    console.log('Promises resolved');

    combinedRes.push(result);
    console.log('All data combined');

    return combinedRes;
}