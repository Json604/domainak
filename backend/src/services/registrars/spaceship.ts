// ✅ ✅ (scrap from DOM selector) (DOES NOT WORK IN HEADLESS)
import { SPACESHIP_URL } from "../../config/env.js"
import type { NativeError, RegistrarResponse } from "../../types/index.ts";

export const spaceshipService = async (spaceshipPage: any, domain: string):Promise<RegistrarResponse> => {
    try {
        await spaceshipPage.goto(`${SPACESHIP_URL}?query=${domain}&tab=domains`)
        console.log('🟤 Entered spaceship page');
    
        await Promise.race([
            spaceshipPage.waitForSelector('span.main-result__available__prices__text__purchase', { timeout: 20000 }),
            spaceshipPage.waitForSelector('div.main-result__unavailable__container', { timeout: 20000 }),
            spaceshipPage.waitForSelector('div.main-result__aftermarket__container', { timeout: 20000 }),
        ])

        console.log('🟤 Spaceship Promise race resolved');
        
        const priceEl = await spaceshipPage.$('span.main-result__available__prices__text__purchase')
        const afterMarketEl = await spaceshipPage.$('div.main-result__aftermarket__container')
        
        if(priceEl){
            return{
                registrar: 'Spaceship',
                status: 'Available',
                price: await spaceshipPage.$eval('span.main-result__available__prices__text__purchase', (e: any) => e.textContent.trim())
            }
        }
        if(afterMarketEl){
            return{
                registrar: 'Spaceship',
                status: 'Available Aftermarket',
                price: null
            }
        }

        return {
            registrar: 'Spaceship',
            status: 'Unavailable',
            price: null
        }

    
    } catch (error) {
        const err = error as NativeError
        throw{
            registrar: 'Spaceship',
            type: err.name || 'Unknown Error',
            message: err.message || 'Unknown failure'
        }
    }

}


// ⚠️⚠️ not wokring for unavailable domains ⚠️⚠️