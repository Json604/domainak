import { dynaService } from "./registrars/dynadot.js";
import { godaddyService } from "./registrars/godaddy.js";
import { porkbunservice } from "./registrars/porkbun.js";
import { hostingerService } from "./registrars/hostinger.js";
import { spaceshipService } from "./registrars/spaceship.js";
import { namecheapService } from "./registrars/namecheap.js";
import { closeSearchContext, openSearchPages } from "./browser.js";
import type { NativeError, SearchEvent } from "../types/index.ts";

// One Chrome at a time is plenty for a single machine: searches queue
// up behind each other and recent results are reused.
const CACHE_TTL_MS = 10 * 60 * 1000
const cache = new Map<string, { at: number, data: Awaited<ReturnType<typeof scrape>> }>()
let queue: Promise<unknown> = Promise.resolve()
let inFlight = 0

const REGISTRARS = [
    ['Godaddy', godaddyService],
    ['Dynadot', dynaService],
    ['Porkbun', porkbunservice],
    ['Hostinger', hostingerService],
    ['Namecheap', namecheapService],
    ['Spaceship', spaceshipService],
] as const

// Page titles of the bot walls (Cloudflare, Akamai, PerimeterX)
const BOT_CHECK_TITLE = /just a moment|attention required|access denied|access to this page has been denied|security check/i

// `onEvent` streams progress for the live story on the results page
export const searchService = async(domain: string, onEvent: (event: SearchEvent) => void = () => {}) => {
    const key = domain.toLowerCase()
    const cached = cache.get(key)
    if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
        console.log('🟢 Serving cached result for', key);
        return cached.data
    }

    if (inFlight > 0) onEvent({ type: 'queued' })
    inFlight++
    const run = queue.then(() => scrape(domain, onEvent))
    queue = run.catch(() => {})
    const data = await run.finally(() => { inFlight-- })

    for (const [k, v] of cache) {
        if (Date.now() - v.at >= CACHE_TTL_MS) cache.delete(k)
    }
    if (data.result.some(r => r.status === 'fulfilled')) {
        cache.set(key, { at: Date.now(), data })
    }
    return data
}

const scrape = async(domain: string, onEvent: (event: SearchEvent) => void) => {
    let context = null
    try {
        onEvent({ type: 'stage', stage: 'launch' })
        const opened = await openSearchPages(REGISTRARS.length)
        context = opened.context
        onEvent({ type: 'stage', stage: 'open' })

        // console.log('Beginning Primary availability check');
        
        // // ⚠️ Primary availability check ⚠️
        // const primaryCheck = await Promise.allSettled([godaddyService(godaddyPage, domain)]) 
        // console.log('Primary check resloved');
        
        // if((primaryCheck[0]?.value?.status.toLowerCase() === 'taken')){
            //     return 'This domain is already taken.'
        // }

        console.log('Parallel scraping started');

        const secondaryPromises = await Promise.allSettled(REGISTRARS.map(async ([registrar, service], i) => {
            const page = opened.pages[i]!
            let settled = false
            onEvent({ type: 'phase', registrar, phase: 'loading' })
            page.on('domcontentloaded', async () => {
                const title = await page.title().catch(() => '')
                if (!settled) onEvent({ type: 'phase', registrar, phase: BOT_CHECK_TITLE.test(title) ? 'bot' : 'reading' })
            })

            const result = await service(page, domain).then(
                (value) => ({ status: 'fulfilled', value }) as const,
                (reason) => ({ status: 'rejected', reason }) as const,
            )
            settled = true
            onEvent({ type: 'result', result })
            if (result.status === 'rejected') throw result.reason
            return result.value
        }))

        console.log('Promises resolved, returning combined data...');

        await closeSearchContext(context)
        console.log('🟢 Search window closed');

        return{
            domain,
            result: [
                // ...primaryCheck,
                ...secondaryPromises
            ]
        };
    } catch (error) {
        const err = error as NativeError
        console.error('🔴 Search service error:', err.message);
        await closeSearchContext(context)
        throw{
            success: false,
            type: err.name || 'UnknownError',
            message: err.message || 'Failed to search domain',
        }
    }
}
