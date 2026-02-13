import { Response, NextFunction } from "express";
import { ExtendedRequest } from "../../shared/types/ExpressTypes";
import crypto from "crypto";

const CSRF_TOKEN_COOKIE = "csrf-token";
const CSRF_TOKEN_HEADER = "x-csrf-token";

/**
 * Middleware CSRF utilisant le pattern double submit cookie
 * Génère un token CSRF et le stocke dans un cookie
 */
export const csrfMiddleware = (req: ExtendedRequest, res: Response, next: NextFunction) => {
  // Générer un token CSRF si absent
  if (!req.cookies?.[CSRF_TOKEN_COOKIE]) {
    const token = crypto.randomBytes(32).toString("hex");
    res.cookie(CSRF_TOKEN_COOKIE, token, {
      httpOnly: false, // Doit être accessible par JavaScript pour le header
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 24 heures
    });
    // Ajouter le token à la requête pour les routes GET
    req.csrfToken = token;
  } else {
    req.csrfToken = req.cookies[CSRF_TOKEN_COOKIE];
  }

  // Exclure les routes GET (lecture seule)
  if (req.method === "GET") {
    return next();
  }

  // Vérifier le token pour les méthodes modifiantes
  const cookieToken = req.cookies?.[CSRF_TOKEN_COOKIE];
  const headerToken = req.headers[CSRF_TOKEN_HEADER] as string;

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return res.jsonError("Token CSRF invalide ou manquant", 403);
  }

  next();
};

/**
 * Endpoint pour récupérer le token CSRF
 */
export const getCsrfToken = (req: ExtendedRequest, res: Response) => {
  const token = req.csrfToken || req.cookies?.[CSRF_TOKEN_COOKIE];
  if (!token) {
    return res.jsonError("Token CSRF non disponible", 500);
  }
  res.jsonSuccess({ token });
};

