// ✅ ✅ (works with waitUntil only) (DOES NOT WORK IN HEADLESS)

// HOSTINGER ENDPOINT
    // page.on("response", async (response) => {
    //     console.log('1');
    //     const req = response.request();
    //     const type = req.resourceType();
        
    //     if ((type === "xhr" || type === "fetch") && req.url().includes("/api/domain/single-domain-search")) {
    //         const url = response.url();
            
    //         try {
    //             const text = await response.json();
    //             capturedResponses.push({ url, text });
    //         } catch (err) {
    //             // ignore
    //         }
    //     }
    // });