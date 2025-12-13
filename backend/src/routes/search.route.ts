import { Router } from "express";
import { searchController } from "../controllers/search.controller.ts";

export const searchRouter = Router();

searchRouter.get('/search', searchController)