import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import connectDB from "./config/db.js";
import rateLimiter from "./middleware/rateLimiter.js";
import { accessRoute } from "./middleware/auth.middleware.js";

import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import couponRoutes from "./routes/coupon.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT;

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(rateLimiter);
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", accessRoute, cartRoutes);
app.use("/api/coupon", accessRoute, couponRoutes);
app.use("/api/payments", accessRoute, paymentRoutes);
app.use("/api/analytics", accessRoute, analyticsRoutes);

await connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
});
