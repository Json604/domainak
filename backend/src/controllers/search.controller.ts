import {searchService} from "../services/search.service.ts"

export const searchController = async (req,res,next) => {
    try {
        // const {search} = req.body
        const results = await searchService()

        res.json({
            success: true,
            data: results
        })
        
    } catch (error) {
        next(error)
    }
}