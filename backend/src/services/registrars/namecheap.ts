// ✅ ✅ (works with waitUntil only) (DOES NOT WORK IN HEADLESS)    
// page.on("response", async (response) => {
//     const req = response.request();
//     const type = req.resourceType();
    
//     if ((type === "xhr" || type === "fetch") && (req.url().includes('/domains/tlds.ashx') || req.url().startsWith("https://rtb.namecheapapi.com/api/domains"))) {
//         const url = response.url();
        
//         try {
//             const text = await response.json();
//             capturedResponses.push({ url, text });
//             console.log("Raw data pushed");
//         } catch (err) {
//             // ignore
//         }
//     }
// });


// await page.goto("https://www.namecheap.com/domains/registration/results/?domain=kartikey.io",{waitUntil:'networkidle2'});

// console.log("Filtering Raw data");

// const url1 = capturedResponses.find(r => r.url.includes("/domains/tlds.ashx"))?.text;
// const url2 = capturedResponses.find(r => r.url.startsWith("https://rtb.namecheapapi.com/api/domains"))?.text;
// variants.push(url1.filter(item => item.Name.toLowerCase() === "ai"));
// variants.push(url2.domains.find(item => item.name.toLowerCase() === "ai"));

// console.log("Namecheap filtered data ready");

export const namecheapService = async (namecheapPage, domain) => {
    let capturedResponses = []
    let variants = []

    namecheapPage.on("response", async (response) => {
        const req = response.request();
        const type = req.resourceType();
        
        if ((type === "xhr" || type === "fetch") ) {
            const url = response.url();
            
            try {
                const text = await response.json();
                capturedResponses.push({ url, text });
                console.log("Raw data pushed");
            } catch (err) {
                // ignore
            }
        }
    });
    

    await namecheapPage.goto("https://www.namecheap.com/domains/registration/results/?domain=kartikey.ai",{waitUntil:'networkidle0'});

    console.log("🟠 Filtering Raw data");

    const url1 = capturedResponses.find(r => r.url.includes("/domains/tlds.ashx"))?.text;
    const url2 = capturedResponses.find(r => r.url.startsWith("https://rtb.namecheapapi.com/api/domains"))?.text;
    variants.push(url1.filter(item => item.Name.toLowerCase() === "ai"));
    variants.push(url2.domains.find(item => item.name.toLowerCase() === "ai"));

    console.log("🟠 Namecheap filtered data ready");

    return capturedResponses
}



// ⚠️https://domains.revved.com/v1/domainStatus?domains⚠️.  TO CHECK AVAILABILITY