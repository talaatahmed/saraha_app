import { rateLimit } from "express-rate-limit";

export const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  limit: 10,
  legacyHeaders: false,
  message: "!!! Too many requests !!!",
});
