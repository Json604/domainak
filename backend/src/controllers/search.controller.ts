import {searchService} from "../services/search.service.ts"
import { parse } from "tldts"

export const searchController = async (req,res,next) => {
    try {
        const domain = req.query.q

        const domainCheck = parse(domain, {allowPrivateDomains: true})
        if(domainCheck.domain !== null && domainCheck.publicSuffix !== null && domainCheck.isIp === false && domainCheck.domainWithoutSuffix?.length > 0){
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
        console.error('🔴 Search controller error:', error)
        return res.status(500).json({
            success: false,
            message: error.message || 'Something went wrong while searching. Please try again.',
            type: error.type || 'ServerError'
        })
    }
}