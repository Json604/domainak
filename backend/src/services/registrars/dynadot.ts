// ✅ ✅ !!!!!!!!!!!!!!!!!!!(WORKS HEADLESS)
import { DYNADOT_URL } from "../../config/env.js";
import type { NativeError, RegistrarResponse } from "../../types/index.ts";

export const dynaService = async (dynaPage: any, domain: string): Promise<RegistrarResponse> => {
    try {
        const responsePromise = dynaPage.waitForResponse((res: any) => res.url().startsWith("https://www.dynadot.com/dynadot-vue-api/dynadot-service/domain-search-api?command=search_result"),{ timeout: 20000 });
        console.log('🔵 Dynadot network req promise started');
    
        await dynaPage.goto(`${DYNADOT_URL}?domain=${domain}`);
        console.log('🔵 Dyndaot URL set');
    
        const response = await responsePromise
        console.log('🔵 Dynadot network req resolved');
    
        const raw = await response.json();
        const items = raw.data.resultItems;
        
        console.log("🔵 Filtering DynaRes");
        const exactMatch = await items.find((item: any) => item.isExactResult === true);
    
        console.log("🔵 DynaRes Filtered");

        if(exactMatch){
            return {
            registrar: 'Dynadot',
            status: exactMatch.status,
            price: exactMatch.price
            }
        }

        return {
            registrar: 'Dynadot',
            status: 'Unavailable',
            price: null
        };
    } catch (error) {
        const err = error as NativeError
        throw{
            registrar: 'Dynadot',
            type: err.name || 'Unknown Error',
            message: err.message || 'Unknown failure'
        }
    }
}

// Primary availability check 2
// export const dynaAvailabilityCheck = (exactMatch) => {
//     return exactMatch.status
// }