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
                const text = await response.json();
                capturedResponses.push({ url, text });
            } catch (err) {
                // ignore
            }
        }
    });

    await page.goto("https://www.spaceship.com/domain-search/?query=kartikeyattri.com&beast=false&tab=domains",);


    // SPACESHIP work code
    // await page.waitForSelector('span.main-result__available__prices__text__purchase', { timeout: 15000 });
    // const spaceshipPrice = await page.$eval(
    //     'span.main-result__available__prices__text__purchase',
    //     el => el.textContent.trim()
    // );
    // capturedResponses.push({ spaceshipPrice });


    // PORKBUN work code
    // await page.locator('::-p-aria(Domain Search)').fill('kartikey.io');
    // await page.locator('::-p-aria(submit search)').click();

    await page.setViewport({width: 0, height: 0});
   
    // Wait for dynamic JS XHRs
    // await page.waitForNetworkIdle({ idleTime: 1000, timeout: 10000 });

    
    // TYPE 1 https://www.godaddy.com/en-in/domainsearch/find?domainToCheck=kartikey.io  ✅ (works without waituntil + waitForNetworkIdle only)
    
    // TYPE 2
    // https://www.hostinger.com/in/domain-name-results?domain=kartikey.io&from=domain-name-search  ✅ (works with waitUntil only)
    // https://www.namecheap.com/domains/registration/results/?domain=kartikey.io  ✅ (works with waitUntil only)

    // TYPE 3
    // https://www.dynadot.com/domain/search?domain=kartikey.io ✅ (works with waitForNetworkIdle only)
    // https://porkbun.com/products/domains ✅ (works with waitForNetworkIdle only)

    // TYPE 4
    // https://domains.squarespace.com/domain-search ✅ (gives the pricing sheet based on region and currency)
    // https://www.spaceship.com/domain-search/?query=kartikeyattri.com&beast=false&tab=domains ✅  (scrap from DOM selector)


//     await browser.close();

    return capturedResponses;
}