// ✅ ✅ (scrap from DOM selector) (DOES NOT WORK IN HEADLESS)

    // SPACESHIP work code
    // await page.waitForSelector('span.main-result__available__prices__text__purchase', { timeout: 15000 });
    // const spaceshipPrice = await page.$eval(
    //     'span.main-result__available__prices__text__purchase',
    //     el => el.textContent.trim()
    // );
    // capturedResponses.push({ spaceshipPrice });