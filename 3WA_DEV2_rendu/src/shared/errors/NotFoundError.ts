import { AppError } from "./AppError";

/**
 * Erreur de ressource non trouvée (404)
 */
export class NotFoundError extends AppError {
  constructor(message: string = "Ressource non trouvée", code?: string) {
    super(message, 404, true, code);
  }
}

