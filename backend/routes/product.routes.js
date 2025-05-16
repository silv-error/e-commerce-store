import express from "express";
import { accessRoute, adminRoute } from "../middleware/auth.middleware.js";
import { getAllProducts } from "../controllers/product.controller.js";

const router = express.Router();

router.get("/", accessRoute, adminRoute, getAllProducts);

export default router;