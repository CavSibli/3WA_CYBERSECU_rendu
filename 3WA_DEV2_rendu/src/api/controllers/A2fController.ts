import { Request, Response, NextFunction } from "express";
import { GenerateQrCodeUseCase } from "../../application/usecases/GenerateQrCodeUseCase";
import { EnableOtpUseCase } from "../../application/usecases/EnableOtpUseCase";
import { VerifyOtpUseCase } from "../../application/usecases/VerifyOtpUseCase";
import { DisableOtpUseCase } from "../../application/usecases/DisableOtpUseCase";
import { RegenerateBackupCodesUseCase } from "../../application/usecases/RegenerateBackupCodesUseCase";

export class A2fController {
  constructor(
    private readonly generateQrCodeUseCase: GenerateQrCodeUseCase,
    private readonly enableOtpUseCase: EnableOtpUseCase,
    private readonly verifyOtpUseCase: VerifyOtpUseCase,
    private readonly disableOtpUseCase: DisableOtpUseCase,
    private readonly regenerateBackupCodesUseCase: RegenerateBackupCodesUseCase
  ) {}

  // GET /api/a2f/qrcode
  async getQrCode(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.jsonError("Vous n'êtes pas connecté", 401);
      }

      const result = await this.generateQrCodeUseCase.execute({
        userId: req.user.id,
      });

      return res.jsonSuccess({ qrCode: result.qrCode }, 200);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/a2f/enable
  async enableOtp(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.jsonError("Vous n'êtes pas connecté", 401);
      }

      const { secret, code } = req.body;

      if (!secret || !code) {
        return res.jsonError("Le secret et le code de vérification sont obligatoires", 400);
      }

      const result = await this.enableOtpUseCase.execute({
        userId: req.user.id,
        secret,
        verificationCode: code,
      });

      return res.jsonSuccess({ backupCodes: result.backupCodes }, 200);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/a2f/verify
  async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.jsonError("Vous n'êtes pas connecté", 401);
      }

      const { code } = req.body;

      if (!code) {
        return res.jsonError("Le code est obligatoire", 400);
      }

      const result = await this.verifyOtpUseCase.execute({
        userId: req.user.id,
        code,
      });

      return res.jsonSuccess(
        { isValid: result.isValid, isBackupCode: result.isBackupCode },
        200
      );
    } catch (error) {
      next(error);
    }
  }

  // POST /api/a2f/disable
  async disableOtp(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.jsonError("Vous n'êtes pas connecté", 401);
      }

      await this.disableOtpUseCase.execute({
        userId: req.user.id,
      });

      return res.jsonSuccess({ message: "OTP désactivé avec succès" }, 200);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/a2f/backup-codes
  async getBackupCodes(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.jsonError("Vous n'êtes pas connecté", 401);
      }

      // Note: Pour des raisons de sécurité, on ne retourne pas les codes de secours
      // Ils ne sont affichés qu'une seule fois lors de l'activation
      return res.jsonError("Les codes de secours ne peuvent être récupérés qu'une seule fois lors de l'activation", 403);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/a2f/regenerate-backup-codes
  async regenerateBackupCodes(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.jsonError("Vous n'êtes pas connecté", 401);
      }

      const result = await this.regenerateBackupCodesUseCase.execute({
        userId: req.user.id,
      });

      return res.jsonSuccess({ backupCodes: result.backupCodes }, 200);
    } catch (error) {
      next(error);
    }
  }
}

