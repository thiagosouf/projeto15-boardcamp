import { Router } from "express";
import { getCategory, postCategory } from "../controllers/categoryController.js";

const categoryRouter = Router();

categoryRouter.get("/categories", getCategory);
categoryRouter.post("/categories", postCategory);

export default categoryRouter;