import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/user.model.js";

dotenv.config();

export const accessRoute = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;
    if(!token) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if(!decoded) {
      return res.status(401).json({ error: "Unauthorized: Invalid access token" });
    }

    const user = await User.findById(decoded.userId).select("-password");
    if(!user) {
      return res.status(404).json({ error: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error(`Error accessing route: ${error.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
}

export const adminRoute = async (req, res, next) => {
  if(req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({ error: "Forbidden: Admin access is required" });
  }
}