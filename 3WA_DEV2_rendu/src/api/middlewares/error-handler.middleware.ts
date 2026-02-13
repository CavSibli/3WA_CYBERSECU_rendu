import type { NextFunction, Request, Response } from "express";
import { Logger } from "../../infrastructure/services/Logger";
import { AppError } from "../../shared/errors";

interface ErrorResponse {
  message: string;
  code: number;
  stack?: string;
}

export const errorHandlerMiddleware = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const isProduction = process.env.NODE_ENV === "production";
  const statusCode = err instanceof AppError ? err.statusCode : 500;

  // Logger l'erreur avec le service de logging structuré
  Logger.errorWithStack("Request error", err, {
    statusCode,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  // En production, masquer les détails d'erreur
  const message = isProduction
    ? statusCode >= 500
      ? "Une erreur interne s'est produite. Veuillez réessayer plus tard."
      : err.message || "Une erreur s'est produite"
    : err.message || "An error occurred";

  // Ne jamais exposer les stack traces en production
  const errorResponse: ErrorResponse = {
    message,
    code: statusCode,
  };

  // En développement, inclure plus de détails
  if (!isProduction && err.stack) {
    errorResponse.stack = err.stack;
  }

  res.jsonError(message, statusCode);
};
