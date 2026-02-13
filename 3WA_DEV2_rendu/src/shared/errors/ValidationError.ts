import { AppError } from "./AppError";

/**
 * Erreur de validation (400)
 */
export class ValidationError extends AppError {
  constructor(message: string = "Erreur de validation", code?: string) {
    super(message, 400, true, code);
  }
}

