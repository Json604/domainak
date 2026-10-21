import { Router } from "express";
import { searchController, searchStreamController } from "../controllers/search.controller.js";

export const searchRouter = Router();

searchRouter.get('/search', searchController)
searchRouter.get('/search/stream', searchStreamController)