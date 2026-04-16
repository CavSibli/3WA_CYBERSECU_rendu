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
  _next: NextFunction
) => {
  const isProduction = process.env.NODE_ENV === "production";
  const statusCode = err instanceof AppError ? err.statusCode : 500;

  // #region agent log
  fetch("http://127.0.0.1:7723/ingest/3e757b8c-e55b-48a6-b819-71791092e113", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "432427",
    },
    body: JSON.stringify({
      sessionId: "432427",
      runId: "auth-500-debug",
      hypothesisId: "H8",
      location: "src/api/middlewares/error-handler.middleware.ts:20",
      message: "API error handled",
      data: {
        statusCode,
        path: req.path,
        method: req.method,
        errorName: err.name,
        errorMessage: err.message,
        hasEmail: typeof req.body?.email === "string",
        hasName: typeof req.body?.name === "string",
        hasPassword: typeof req.body?.password === "string",
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

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
