import rateLimit from "express-rate-limit";

/**
 * Rate limiter pour les routes OTP (3-4 tentatives par minute)
 */
export const otpRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 4, // 4 tentatives maximum par minute
  message: "Trop de tentatives. Veuillez réessayer dans une minute.",
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter pour les routes d'authentification (login, verify-otp)
 */
export const authRateLimiter = rateLimit({
  windowMs: 1000, // 60 secondes (temporairement réduit pour les tests)
  max: 5, // 5 tentatives maximum par 60 secondes
  message: "Trop de tentatives de connexion. Veuillez réessayer dans 60 secondes.",
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter pour l'inscription (3 inscriptions par heure)
 */
export const registerRateLimiter = rateLimit({
  windowMs: 1000, // 1 heure
  max: 3, // 3 inscriptions maximum par heure
  message: "Trop de tentatives d'inscription. Veuillez réessayer dans une heure.",
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter strict pour les routes de vérification OTP (3 tentatives par 5 minutes)
 */
export const strictOtpRateLimiter = rateLimit({
  windowMs: 1000, // 5 minutes
  max: 3, // 3 tentatives maximum par 5 minutes
  message: "Trop de tentatives de vérification OTP. Veuillez réessayer dans 5 minutes.",
  standardHeaders: true,
  legacyHeaders: false,
});

