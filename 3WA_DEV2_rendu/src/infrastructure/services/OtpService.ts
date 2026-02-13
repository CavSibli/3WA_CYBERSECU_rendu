import { generateSecret, verify, generateURI, NobleCryptoPlugin } from "otplib";
import crypto from "crypto";

const cryptoPlugin = new NobleCryptoPlugin();

export class OtpService {
  /**
   * Génère un secret OTP aléatoire
   */
  generateSecret(): string {
    return generateSecret();
  }

  /**
   * Vérifie un token OTP avec un secret
   */
  async verifyToken(secret: string, token: string): Promise<boolean> {
    try {
      const result = await verify({ 
        token, 
        secret,
        crypto: cryptoPlugin,
      });
      return result.valid;
    } catch (error) {
      return false;
    }
  }

  /**
   * Génère des codes de secours aléatoires
   * @param count Nombre de codes à générer (par défaut 8)
   */
  generateBackupCodes(count: number = 8): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      // Génère un code de 8 caractères alphanumériques
      const code = crypto.randomBytes(4).toString("hex").toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  /**
   * Génère l'URI pour le QR code (format standard TOTP)
   */
  generateKeyUri(accountName: string, secret: string, appName: string): string {
    return generateURI({
      accountName,
      issuer: appName,
      secret,
    });
  }
}

