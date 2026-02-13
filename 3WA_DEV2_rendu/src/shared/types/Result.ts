/**
 * Type Result pour la gestion d'erreurs type-safe
 * Alternative à throw new Error() pour une meilleure gestion des erreurs
 */

export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * Helper pour créer un Result success
 */
export function ok<T>(data: T): Result<T, never> {
  return { success: true, data };
}

/**
 * Helper pour créer un Result error
 */
export function err<E>(error: E): Result<never, E> {
  return { success: false, error };
}

/**
 * Helper pour vérifier si un Result est un succès
 */
export function isOk<T, E>(result: Result<T, E>): result is { success: true; data: T } {
  return result.success === true;
}

/**
 * Helper pour vérifier si un Result est une erreur
 */
export function isErr<T, E>(result: Result<T, E>): result is { success: false; error: E } {
  return result.success === false;
}

