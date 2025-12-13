// import puppeteer from 'puppeteer';
import { connect } from "puppeteer-real-browser";

export const searchService = async() => {
   const { browser, page } = await connect({
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

  
  let capturedResponses = []
  
  page.on('request', request => {
      console.log(`Req: ${request.url()}`);
    });
    
    page.on("response", async (response) => {
        console.log('1');
        const req = response.request();
        const type = req.resourceType();
        
        if (type === "xhr" || type === "fetch") {
            const url = response.url();
            
            try {
                const text = await response.text();
                capturedResponses.push({ url, text });
            } catch (err) {
                // ignore
            }
        }
    });

    await page.goto("https://www.dynadot.com/domain/search?domain=kartikey.io");
    
    // https://www.godaddy.com/en-in/domainsearch/find?domainToCheck=kartikey.io  ✅
    // https://www.hostinger.com/domain-name-results?search=kartikey.io&domain=kartikeyattri.com&from=domain-name-search  ❌
    // https://www.spaceship.com/domain-search/?query=kartikeyattri.com&beast=false&tab=domains  ❌
    // Interaction needed: https://porkbun.com/checkout/search?prb=903e473d1a&q=kartikeyattri.com&tlds=&idnLanguage=&search=search&csrf_pb=ba1619d5d107667bbfc6f7339b19c286  ❌
    // https://www.namecheap.com/domains/registration/results/?domain=kartikry.io  ❌
    // https://www.dynadot.com/domain/search?domain=kartikey.io ❌

//     await browser.close();

    return capturedResponses;
}