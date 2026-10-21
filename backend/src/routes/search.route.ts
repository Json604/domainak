import { Router } from "express";
import { searchController, searchStreamController } from "../controllers/search.controller.js";
import { ratesController } from "../controllers/rates.controller.js";

export const searchRouter = Router();

searchRouter.get('/search', searchController)
searchRouter.get('/search/stream', searchStreamController)
searchRouter.get('/rates', ratesController)