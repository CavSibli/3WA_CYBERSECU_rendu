/**
 * Classe d'erreur pour l'authentification côté frontend
 */
export class AuthError extends Error {
  public readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "AuthError";
    this.code = code;

    // Maintenir le stack trace (compatible navigateurs + Node)
    const errorWithStack = Error as ErrorConstructor & {
      captureStackTrace?: (targetObject: object, constructorOpt?: abstract new (...args: never[]) => unknown) => void
    };
    errorWithStack.captureStackTrace?.(this, AuthError);
  }
}

