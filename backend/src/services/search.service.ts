import { dynaService } from "./registrars/dynadot.js";
import { godaddyService } from "./registrars/godaddy.js";
import { porkbunservice } from "./registrars/porkbun.js";
import { hostingerService } from "./registrars/hostinger.js";
import { spaceshipService } from "./registrars/spaceship.js";
import { namecheapService } from "./registrars/namecheap.js";
import { closeSearchContext, openSearchPages } from "./browser.js";
import type { NativeError, RegistrarResponse, SearchEvent } from "../types/index.ts";

// One Chrome at a time is plenty for a single machine: searches queue
// up behind each other and recent results are reused.
const CACHE_TTL_MS = 10 * 60 * 1000
const cache = new Map<string, { at: number, data: SearchData }>()
let queue: Promise<unknown> = Promise.resolve()

type SearchData = Awaited<ReturnType<typeof scrape>>
type Listener = (event: SearchEvent) => void

// One running search per domain+country. Asking again (another tab, a double
// click) joins it instead of scraping twice; when everyone watching has left
// (e.g. they fixed a typo and searched again), it's cancelled so the next
// search doesn't wait behind it.
interface Job {
    listeners: Set<Listener>
    events: SearchEvent[]
    abort: AbortController
    promise: Promise<SearchData>
}
const jobs = new Map<string, Job>()

type RegistrarService = (page: any, domain: string, country: string | null) => Promise<RegistrarResponse>

const REGISTRARS: [string, RegistrarService][] = [
    ['Godaddy', godaddyService],
    ['Dynadot', dynaService],
    ['Porkbun', porkbunservice],
    ['Hostinger', hostingerService],
    ['Namecheap', namecheapService],
    ['Spaceship', spaceshipService],
]

// Page titles of the bot walls (Cloudflare, Akamai, PerimeterX)
const BOT_CHECK_TITLE = /just a moment|attention required|access denied|access to this page has been denied|security check/i

// `country` (ISO code, from the visitor's browser) picks local registrar sites;
// `onEvent` streams progress for the live story on the results page;
// `signal` says the caller stopped listening
export const searchService = async(domain: string, country: string | null = null, onEvent: Listener = () => {}, signal?: AbortSignal) => {
    const key = `${domain.toLowerCase()}|${country ?? ''}`
    const cached = cache.get(key)
    if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
        console.log('🟢 Serving cached result for', key);
        return cached.data
    }

    let job = jobs.get(key)
    if (!job || job.abort.signal.aborted) {
        const abort = new AbortController()
        const listeners = new Set<Listener>()
        const events: SearchEvent[] = []
        const emit: Listener = (event) => {
            events.push(event)
            listeners.forEach((listener) => listener(event))
        }
        if (jobs.size > 0) emit({ type: 'queued' })
        const promise = queue.then(() => scrape(domain, country, emit, abort.signal))
        queue = promise.catch(() => {})
        const newJob: Job = { listeners, events, abort, promise }
        jobs.set(key, newJob)

        const settle = () => { if (jobs.get(key) === newJob) jobs.delete(key) }
        promise.then((data) => {
            settle()
            for (const [k, v] of cache) {
                if (Date.now() - v.at >= CACHE_TTL_MS) cache.delete(k)
            }
            // Only complete answers: if a registrar failed, "Try again" should really try again
            if (data.result.every(r => r.status === 'fulfilled')) {
                cache.set(key, { at: Date.now(), data })
            }
        }, settle)
        job = newJob
    }

    // Catch up on what this search has already done, then follow along
    const current = job
    current.events.forEach(onEvent)
    current.listeners.add(onEvent)
    signal?.addEventListener('abort', () => {
        current.listeners.delete(onEvent)
        if (current.listeners.size === 0) current.abort.abort()
    }, { once: true })

    try {
        return await current.promise
    } finally {
        current.listeners.delete(onEvent)
    }
}

const scrape = async(domain: string, country: string | null, onEvent: Listener, signal: AbortSignal) => {
    let context: Awaited<ReturnType<typeof openSearchPages>>['context'] | null = null
    // Cancelled while running: closing the window makes every registrar stop right away
    const onAbort = () => { void closeSearchContext(context) }
    try {
        // Cancelled while it waited in the queue: nobody's watching, skip it
        if (signal.aborted) throw { name: 'AbortError', message: 'Search cancelled' }
        onEvent({ type: 'stage', stage: 'launch' })
        const opened = await openSearchPages(REGISTRARS.length)
        context = opened.context
        if (signal.aborted) onAbort()
        signal.addEventListener('abort', onAbort, { once: true })
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

            const result = await service(page, domain, country).then(
                (value) => ({ status: 'fulfilled', value }) as const,
                (reason) => ({ status: 'rejected', reason }) as const,
            )
            settled = true
            onEvent({ type: 'result', result })
            if (result.status === 'rejected') throw result.reason
            return result.value
        }))

        console.log('Promises resolved, returning combined data...');

        signal.removeEventListener('abort', onAbort)
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
        signal.removeEventListener('abort', onAbort)
        await closeSearchContext(context)
        throw{
            success: false,
            type: err.name || 'UnknownError',
            message: err.message || 'Failed to search domain',
        }
    }
}
