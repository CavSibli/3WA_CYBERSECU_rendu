import jwt from "jsonwebtoken";
import { getEnvVariable } from "../../utility/utils";

export interface UserPayload {
  id: string;
  email: string;
  name: string;
  role: string;
}

export class JwtService {
  private readonly secret: string;
  private readonly defaultExpiration: string;

  constructor() {
    this.secret = getEnvVariable("JWT_SECRET");
    this.defaultExpiration = "1h";
  }

  /**
   * Génère un token JWT pour un utilisateur
   * @param user - Les données de l'utilisateur
   * @param expiresIn - Durée de validité (par défaut: 1h)
   * @returns Le token JWT
   */
  generateToken(user: UserPayload, expiresIn?: string): string {
    const payload: UserPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    return jwt.sign(payload, this.secret, {
      expiresIn: expiresIn || this.defaultExpiration,
    });
  }

  /**
   * Génère un token temporaire (pour OTP)
   * @param user - Les données de l'utilisateur
   * @returns Le token temporaire JWT
   */
  generateTempToken(user: UserPayload): string {
    const payload = {
      ...user,
      temp: true, // Flag pour indiquer que c'est un token temporaire
    };

    return jwt.sign(payload, this.secret, {
      expiresIn: "5m", // Token temporaire valide 5 minutes
    });
  }

  /**
   * Vérifie et décode un token JWT
   * @param token - Le token à vérifier
   * @returns Le payload décodé
   */
  verifyToken(token: string): UserPayload {
    return jwt.verify(token, this.secret) as UserPayload;
  }
}

