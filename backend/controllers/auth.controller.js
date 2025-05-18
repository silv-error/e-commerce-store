import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { generateAccessToken, generateRefreshToken } from "../libs/utils/generateTokens.js";

dotenv.config();

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if(!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if(!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const existingUser = await User.findOne({ email }).lean();
    if(existingUser) {
      return res.status(400).json({ error: "User already exist" });
    }

    const newUser = new User({ name, email, password, });

    await Promise.all([
      generateAccessToken(newUser._id, res),
      generateRefreshToken(newUser._id, res),
    ]);
    await newUser.save();

    res.status(201).json({...newUser._doc, password: undefined});
  } catch (error) {
    console.error(`Error in signup controller: ${error.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;


    if(!email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if(!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const validPassword = await user.comparePassword(password);
    if(!validPassword) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    await Promise.all([
      generateAccessToken(user._id, res),
      generateRefreshToken(user._id, res),
    ]);

    res.status(200).json({ ...user._doc, password: undefined });
  } catch (error) {
    console.error(`Error in login controller: ${error.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
}

export const logout = async (req, res) => {
  try {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error(`Error in logout controller: ${error.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
}

export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if(!token) {
      return res.status(404).json({ error: "No refresh token provided" });
    } 

    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

    generateAccessToken(decoded.userId, res);
    res.status(200).json({ message: "Token refreshed successfully" });
  } catch (error) {
    console.error(`Error in refreshToken controller: ${error.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
}

// todo: implement accessRoute
// export const getProfile = async (req, res) => {
//   try {

//   } catch (error) {
//     console.error(`Error in getProfile controller: ${error.message}`);
//     res.status(500).json({ error: "Internal server error" });
//   }
// }