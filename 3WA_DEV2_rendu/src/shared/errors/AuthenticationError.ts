import { AppError } from "./AppError";

/**
 * Erreur d'authentification (401)
 */
export class AuthenticationError extends AppError {
  constructor(message: string = "Identifiants invalides", code?: string) {
    super(message, 401, true, code);
  }
}

