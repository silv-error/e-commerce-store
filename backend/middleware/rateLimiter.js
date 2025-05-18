import { rateLimit } from "express-rate-limit";

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (_, res) => {
    res.status(429).json({ error: "You are being rate limited!" });
  },
});

export default rateLimiter;
