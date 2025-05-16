import express from "express";
import { 
  createProduct, 
  deleteProduct, 
  getAllProducts, 
  getFeaturedProducts, 
  getProductsByCategory, 
  getRecommendedProducts,
  toggleFeaturedProduct
} from "../controllers/product.controller.js";
import { accessRoute, adminRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", accessRoute, adminRoute, getAllProducts);
router.get("/featured", getFeaturedProducts);
router.get("/category/:category", getProductsByCategory);
router.get("/recommendations", getRecommendedProducts);
router.post("/", accessRoute, adminRoute, createProduct);
router.patch("/:id", accessRoute, adminRoute, toggleFeaturedProduct);
router.delete("/:id", accessRoute, adminRoute, deleteProduct);

export default router;