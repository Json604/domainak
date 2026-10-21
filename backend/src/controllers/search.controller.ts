import {searchService} from "../services/search.service.js"
import { parse } from "tldts"
import type { Request, Response, NextFunction } from "express"
import type { ServiceError } from "../types/index.ts"


const isValidDomain = (domain: string) => {
    const domainCheck = parse(domain, {allowPrivateDomains: true})
    return domainCheck.domain !== null && domainCheck.publicSuffix !== null && domainCheck.isIp === false && domainCheck.domainWithoutSuffix !== null && domainCheck.domainWithoutSuffix?.length > 0
}

export const searchController = async (req: Request,res: Response,next: NextFunction) => {
    try {
        const domain = req.query.q as string

        if(isValidDomain(domain)){
            const results = await searchService(domain)

            return res.json({
                success: true,
                data: results
            })
        }

        return res.json({
            success: false,
            message: "Please enter a valid domain name." 
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
    const send = (event: string, data: unknown) => res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)

    const domain = req.query.q as string
    if (!domain || !isValidDomain(domain)) {
        send('failure', { message: 'Please enter a valid domain name.' })
        return res.end()
    }

    try {
        const results = await searchService(domain, (event) => send('progress', event))
        send('done', results)
    } catch (error) {
        const err = error as ServiceError
        console.error('🔴 Search stream error:', err)
        send('failure', { message: err.message || 'Something went wrong while searching. Please try again.' })
    }
    res.end()
}
