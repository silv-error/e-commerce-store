import jwt from "jsonwebtoken";

import User from "../models/user.model.js";

import { generateAccessToken, generateRefreshToken } from "../lib/utils/generateTokenAndSetCookie.js";

export async function signup(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({success: false, error: "All fields are required"});
    }

    const existingUser = await User.findOne({ email });
    if(existingUser) {
      return res.status(400).json({success: false, error: "User already exists"});
    }

    const user = await User.create({ name, email, password });

    Promise.all([
      generateAccessToken(user._id, res),
      generateRefreshToken(user._id, res)
    ]);

    return res.status(201).json({user: { 
      ...user._doc, 
      password: undefined 
    }, success: true, message: "User created successfully"});
  } catch (error) {
    console.error(`Error signing up: ${error.message}`);
    res.status(500).json({success: false, error: "Internal server error"});
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({success: false, error: "All fields are required"});
    }

    const user = await User.findOne({ email });
    if(!user) {
      return res.status(400).json({success: false, error: "Invalid credentials"});
    }

    const validPassword = await user.comparePassword(password);
    if(!validPassword) {
      return res.status(400).json({success: false, error: "Invalid credentials"});
    }

    Promise.all([
      generateAccessToken(user._id, res),
      generateRefreshToken(user._id, res)
    ]);

    res.status(200).json({success: true, user: {
      ...user._doc,
      password: undefined
    }});
  } catch (error) {
    console.error(`Error logging in: ${error.message}`);
    res.status(500).json({success: false, error: "Internal server error"});
  }
}


export async function logout(req, res) {
  try {
    res.cookie("accessToken", "", {maxAge: 0});
    res.cookie("refreshToken", "", {maxAge: 0});
    res.status(200).json({success: true, message: "User logged out successfully"});
  } catch (error) {
    console.error(`Error logging out: ${error.message}`);
    res.status(500).json({success: false, error: "Internal server error"});
  }
}

export async function refreshToken(req, res) {
  try {
    const refreshToken = req.cookies.refreshToken;
    if(!refreshToken) {
      return res.status(401).json({success: false, error: "Unauthorized"});
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN);
    if(!decoded) {
      return res.status(401).json({success: false, error: "Unauthorized"});
    }

    const user = await User.findById(decoded.userId);
    if(!user) {
      return res.status(401).json({success: false, error: "Unauthorized"});
    }

    generateAccessToken(user._id, res)

    res.status(200).json({success: true, message: "Token refreshed successfully"});
  } catch (error) {
    console.error(`Error refreshing token: ${error.message}`);
    res.status(500).json({success: false, error: "Internal server error"});
  }
}

// TODO: create getUser function