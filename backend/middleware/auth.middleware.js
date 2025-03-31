import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const protectRoute = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;
    if(!accessToken) {
      return res.status(401).json({success: false, error: "Unauthorized: No token provided"});
    }

    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN);
    if(!decoded) {
      return res.status(401).json({success: false, error: "Unauthorized: Invalid token"});
    }

    const user = await User.findById(decoded.userId).select("-password");
    if(!user) {
      return res.status(401).json({success: false, error: "Unauthorized: User not found"});
    }

    req.user = user;

    next();
  } catch (error) {
    console.error(`Error protecting route: ${error.message}`);
    res.status(500).json({success: false, error: "Internal server error"});
  }
}

export const adminRoute = (req, res, next) => {
  if(req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({success: false, error: "Forbidden: Admin access required"});
  }
}