import winston from "winston";

const isProduction = process.env.NODE_ENV === "production";

// Format pour la production (JSON structuré)
const productionFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: false }), // Ne pas inclure stack par défaut
  winston.format.json()
);

// Format pour le développement (lisible)
const developmentFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta, null, 2)}`;
    }
    return log;
  })
);

// Créer le logger
export const logger = winston.createLogger({
  level: isProduction ? "info" : "debug",
  format: isProduction ? productionFormat : developmentFormat,
  transports: [
    // Console pour tous les environnements
    new winston.transports.Console({
      stderrLevels: ["error"],
    }),
  ],
});

// Méthodes helper pour un usage plus simple
export class Logger {
  static error(message: string, meta?: Record<string, unknown>): void {
    logger.error(message, meta);
  }

  static warn(message: string, meta?: Record<string, unknown>): void {
    logger.warn(message, meta);
  }

  static info(message: string, meta?: Record<string, unknown>): void {
    logger.info(message, meta);
  }

  static debug(message: string, meta?: Record<string, unknown>): void {
    logger.debug(message, meta);
  }

  /**
   * Logger une erreur avec stack trace uniquement en développement
   */
  static errorWithStack(
    message: string,
    error: Error,
    meta?: Record<string, unknown>
  ): void {
    const logMeta: Record<string, unknown> = {
      ...meta,
      message: error.message,
    };

    // Ajouter stack trace uniquement en développement
    if (!isProduction && error.stack) {
      logMeta.stack = error.stack;
    }

    logger.error(message, logMeta);
  }
}

