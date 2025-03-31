import express from "express";

import { adminRoute, protectRoute } from "../middleware/auth.middleware.js";

import { 
  createProduct, 
  deleteProduct, 
  featuredProducts, 
  getProducts, 
  getProductsByCategory, 
  getRecommendedProducts, 
  toggleFeaturedProduct 
} from "../controllers/product.controller.js";

const router = express.Router();

router.get("/", protectRoute, adminRoute, getProducts);
router.get("/featured", featuredProducts);
router.get("/category/:category", getProductsByCategory);
router.get("/recommendations", getRecommendedProducts);
router.post("/", protectRoute, adminRoute, createProduct);
router.patch("/:productId", protectRoute, adminRoute, toggleFeaturedProduct);
router.delete("/:productId", protectRoute, adminRoute, deleteProduct);

export default router;