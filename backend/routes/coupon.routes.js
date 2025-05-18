import express from "express";
import { accessRoute } from "../middleware/auth.middleware.js";
import { getCoupon, validateCoupon } from "../controllers/coupon.controller.js";

const router = express.Router();

router.get("/", accessRoute, getCoupon);
router.get("/validate", accessRoute, validateCoupon);

export default router;
