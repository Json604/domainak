// ✅ ✅ !!!!!!!!!!!!!!!!!!!(WORKS HEADLESS)
import { DYNADOT_URL } from "../../config/env.ts";

export const dynaService = async (dynaPage, domain) => {
    const responsePromise = dynaPage.waitForResponse(res =>res.url().startsWith("https://www.dynadot.com/dynadot-vue-api/dynadot-service/domain-search-api?command=search_result"),{ timeout: 20000 });
    console.log('🔵 Dynadot network req promise started');

    await dynaPage.goto(`${DYNADOT_URL}?domain=${domain}`);
    console.log('🔵 Dyndaot URL set');

    const response = await responsePromise
    console.log('🔵 Dynadot network req resolved');

    const raw = await response.json();
    const items = raw.data.resultItems;
    
    console.log("🔵 Filtering DynaRes");
    const exactMatch = await items.find(item => item.domain === `${domain}`);
    console.log("🔵 DynaRes Filtered");

    const dynaRes = {
        registrar: 'Dynadot',
        status: exactMatch.status,
        price: exactMatch.price
    }
    console.log('🔵 DynaRes copied');

    return dynaRes;
}     