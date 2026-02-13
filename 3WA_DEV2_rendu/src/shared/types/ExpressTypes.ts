import { Request } from "express";

/**
 * Extension de Request pour ajouter des propriétés personnalisées
 */
export interface ExtendedRequest extends Request {
  csrfToken?: string;
}

declare module "express-serve-static-core" {
  interface Request {
    csrfToken?: string;
  }
}

