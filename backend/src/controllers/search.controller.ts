import {searchService} from "../services/search.service.js"
import { parse } from "tldts"
import type { Request, Response, NextFunction } from "express"
import type { ServiceError } from "../types/index.ts"


export const searchController = async (req: Request,res: Response,next: NextFunction) => {
    try {
        const domain = req.query.q as string

        const domainCheck = parse(domain, {allowPrivateDomains: true})
        if(domainCheck.domain !== null && domainCheck.publicSuffix !== null && domainCheck.isIp === false && domainCheck.domainWithoutSuffix !== null && domainCheck.domainWithoutSuffix?.length > 0){
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