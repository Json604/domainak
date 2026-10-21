import { ratesService } from "../services/rates.service.js"
import type { Request, Response } from "express"
import type { NativeError } from "../types/index.ts"

export const ratesController = async (req: Request, res: Response) => {
    try {
        res.json({ success: true, data: await ratesService() })
    } catch (error) {
        console.error('🔴 Rates error:', (error as NativeError).message)
        res.status(502).json({ success: false, message: 'Exchange rates unavailable' })
    }
}
