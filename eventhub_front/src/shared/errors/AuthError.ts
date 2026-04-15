/**
 * Classe d'erreur pour l'authentification côté frontend
 */
export class AuthError extends Error {
  public readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "AuthError";
    this.code = code;

    // #region agent log
    fetch('http://127.0.0.1:7723/ingest/3e757b8c-e55b-48a6-b819-71791092e113',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'432427'},body:JSON.stringify({sessionId:'432427',runId:'run1',hypothesisId:'H2',location:'src/shared/errors/AuthError.ts:13',message:'AuthError constructed',data:{code},timestamp:Date.now()})}).catch(()=>{});
    // #endregion

    // Maintenir le stack trace (compatible navigateurs + Node)
    const errorWithStack = Error as ErrorConstructor & {
      captureStackTrace?: (targetObject: object, constructorOpt?: abstract new (...args: never[]) => unknown) => void
    };
    errorWithStack.captureStackTrace?.(this, AuthError);
  }
}

