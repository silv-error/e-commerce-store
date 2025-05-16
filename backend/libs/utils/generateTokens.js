import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const generateAccessToken = async (userId, res) => {
  try {
    const token = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });

    res.cookie("accessToken", token, {
      maxAge: 15 * 60 * 1000,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });
  } catch (error) {
    console.error(`Error in generateAccessToken function: ${error.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
}

export const generateRefreshToken = async (userId, res) => {
  try {
    const token = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });

    res.cookie("refreshToken", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });
  } catch (error) {
    console.error(`Error in generateRefreshToken function: ${error.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
}