import express from "express";

import { createProduct, deleteProduct, featuredProducts, getProducts, getRecommendedProducts } from "../controllers/product.controller.js";
import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, adminRoute, getProducts);
router.get("/featured", featuredProducts);
router.get("/category/:category", getProductsByCategory);
router.get("/recommendations", getRecommendedProducts);
router.post("/", protectRoute, adminRoute, createProduct);
router.delete("/:productId", protectRoute, adminRoute, deleteProduct);

export default router;