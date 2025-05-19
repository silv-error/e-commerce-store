import express from "express";
import { accessRoute, adminRoute } from "../middleware/auth.middleware.js";
import { getAnalytics } from "../controllers/analytics.controller.js";

const router = express.Router();

router.get("/", accessRoute, adminRoute, getAnalytics);

export default router;
