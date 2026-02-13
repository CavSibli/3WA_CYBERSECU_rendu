/**
 * Classe d'erreur pour l'authentification côté frontend
 */
export class AuthError extends Error {
  public readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "AuthError";
    this.code = code;

    // Maintenir le stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}

