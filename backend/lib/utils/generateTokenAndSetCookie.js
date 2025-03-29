import jwt from "jsonwebtoken";

export const generateAccessToken = (userId, res) => {
  try {
    const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN, { expiresIn: "15m" });

    res.cookie("accessToken", accessToken, {
      maxAge: 15 * 60 * 1000,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production"
    });
  } catch (error) {
    console.error(`Error generating access token: ${error.message}`);
    process.exit(1);
  }
}

export const generateRefreshToken = (userId, res) => {
  try {
    const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN, { expiresIn: "7d" });

    res.cookie("refreshToken", refreshToken, {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production"
    });
  } catch (error) {
    console.error(`Error generating refresh token: ${error.message}`);
    process.exit(1);
  }
}