import {searchService} from "../services/search.service.js"
import { parseCountry } from "../services/markets.js"
import { normalizeDomain } from "../services/domain.js"
import type { Request, Response, NextFunction } from "express"
import type { ServiceError } from "../types/index.ts"


export const searchController = async (req: Request,res: Response,next: NextFunction) => {
    try {
        const domain = normalizeDomain(req.query.q)

        if(domain){
            const results = await searchService(domain, parseCountry(req.query.country))

            return res.json({
                success: true,
                data: results
            })
        }

        return res.json({
            success: false,
            message: "Please enter a valid domain name, like example.com."
        })

    } catch (error) {
        const err = error as ServiceError
        console.error('🔴 Search controller error:', err)
        return res.status(500).json({
            success: false,
            message: err.message || 'Something went wrong while searching. Please try again.',
            type: err.type || 'ServerError'
        })
    }
}

// Same search, streamed as Server-Sent Events so the results page can show
// each registrar's progress live. Events: `progress`, then `done` or `failure`.
export const searchStreamController = async (req: Request, res: Response) => {
    res.set({
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
    })
    res.flushHeaders()
    // The tab may close mid-search; the search still finishes (and is cached)
    const send = (event: string, data: unknown) => {
        if (!res.writableEnded && !res.destroyed) res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
    }

    const domain = normalizeDomain(req.query.q)
    if (!domain) {
        send('failure', { message: 'Please enter a valid domain name, like example.com.' })
        return res.end()
    }

    // Tab closed or a new search started: let the search service cancel this one
    const stopped = new AbortController()
    res.on('close', () => { if (!res.writableFinished) stopped.abort() })

    try {
        const results = await searchService(domain, parseCountry(req.query.country), (event) => send('progress', event), stopped.signal)
        send('done', results)
    } catch (error) {
        const err = error as ServiceError
        console.error('🔴 Search stream error:', err)
        send('failure', { message: err.message || 'Something went wrong while searching. Please try again.' })
    }
    if (!res.writableEnded) res.end()
}
