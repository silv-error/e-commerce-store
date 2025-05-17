import express from "express";
import { addToCart } from "../controllers/cart.controller.js";
import { accessRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", accessRoute, getCartProducts);
router.post("/", accessRoute, addToCart);
router.delete("/", accessRoute, removeAllFromCart);
router.put("/:id", accessRoute, updateQuantity);

export default router;