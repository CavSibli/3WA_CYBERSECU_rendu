import { AppError } from "./AppError";

/**
 * Erreur liée à l'OTP/2FA (403)
 */
export class OtpError extends AppError {
  constructor(message: string = "Erreur OTP", code?: string) {
    super(message, 403, true, code);
  }
}

