import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { extractToken, getEnvVariable } from "../../utility/utils";

export interface UserPayload {
  id: string;
  email: string;
  name: string;
  role: string;
}

declare module "express-serve-static-core" {
  interface Request {
    user?: UserPayload;
  }
}

export const authenticationMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Essayer d'abord de récupérer le token depuis les cookies (httpOnly)
    let token = req.cookies?.authToken;

    // Si pas de cookie, essayer depuis le header Authorization (pour compatibilité)
    if (!token) {
      const authorization = req.headers.authorization;
      if (authorization) {
        token = extractToken(authorization);
      }
    }

    if (!token) {
      return res.jsonError("Missing authentication token", 403);
    }

    const payload = jwt.verify(token, getEnvVariable("JWT_SECRET")) as UserPayload;
    req.user = payload;

    next();
  } catch (error) {
    next(error);
  }
};
