import {searchService} from "../services/search.service.ts"

export const searchController = async (req,res,next) => {
    try {
        const domain = req.query.q
        const results = await searchService(domain)

        res.json({
            success: true,
            data: results
        })
        
    } catch (error) {
        next(error)
    }
}