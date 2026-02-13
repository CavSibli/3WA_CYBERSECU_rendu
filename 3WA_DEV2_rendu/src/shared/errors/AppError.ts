/**
 * Classe de base pour toutes les erreurs de l'application
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code?: string;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    code?: string
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;

    // Maintenir le stack trace pour le debugging
    Error.captureStackTrace(this, this.constructor);

    // Définir le nom de l'erreur
    this.name = this.constructor.name;
  }
}

