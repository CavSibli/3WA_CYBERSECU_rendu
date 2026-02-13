import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

/**
 * Middleware de validation générique avec Zod
 * @param schema - Le schéma Zod à utiliser pour la validation
 */
export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Valider le body de la requête
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Formater les erreurs Zod de manière lisible
        const errors = error.errors?.map((err) => ({
          field: err.path?.join(".") || "",
          message: err.message || "Erreur de validation",
        })) || [];

        // Construire un message d'erreur lisible
        const errorMessage = errors.length > 0 
          ? errors.map(e => `${e.field ? e.field + ": " : ""}${e.message}`).join(", ")
          : "Erreur de validation";

        return res.jsonError(errorMessage, 400);
      }

      // Erreur inattendue
      next(error);
    }
  };
};

