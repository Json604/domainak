// ✅ ✅ (scrap from DOM selector) (DOES NOT WORK IN HEADLESS)
import { SPACESHIP_URL } from "../../config/env.ts"

export const spaceshipService = async (spaceshipPage, domain) => {
    await spaceshipPage.goto(`${SPACESHIP_URL}?query=${domain}&tab=domains`)
    console.log('🟤 Entered spaceship page');

    await spaceshipPage.waitForSelector('span.main-result__available__prices__text__purchase', { timeout: 20000 });
    const spaceshipRes = await spaceshipPage.$eval(
        'span.main-result__available__prices__text__purchase',
        el => el.textContent.trim()
    );
    console.log('🟤 SpaceshipRes copied');

    return spaceshipRes

}


// ⚠️⚠️ not wokring for unavailable domains ⚠️⚠️