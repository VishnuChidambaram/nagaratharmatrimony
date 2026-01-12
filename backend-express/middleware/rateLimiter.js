import rateLimit from "express-rate-limit";

const isTest = process.env.NODE_ENV === "test" || process.env.JEST_WORKER_ID !== undefined || process.env.JEST_WORKER_ID !== null;

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isTest ? 1000 : 10,
  message: { success: false, message: "Too many login attempts, please try again after 15 minutes" },
  standardHeaders: true,
  legacyHeaders: false,
});

const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: isTest ? 1000 : 3,
  message: { success: false, message: "Too many registration attempts, please try again after 1 hour" },
  standardHeaders: true,
  legacyHeaders: false,
});

export { authLimiter, registrationLimiter };
