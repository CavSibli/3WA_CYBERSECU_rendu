import { Router } from "express";
import { A2fController } from "../controllers/A2fController";
import { authenticationMiddleware } from "../middlewares/authentication.middleware";
import { otpRateLimiter, strictOtpRateLimiter } from "../middlewares/rate-limit.middleware";
import { GenerateQrCodeUseCase } from "../../application/usecases/GenerateQrCodeUseCase";
import { EnableOtpUseCase } from "../../application/usecases/EnableOtpUseCase";
import { VerifyOtpUseCase } from "../../application/usecases/VerifyOtpUseCase";
import { DisableOtpUseCase } from "../../application/usecases/DisableOtpUseCase";
import { RegenerateBackupCodesUseCase } from "../../application/usecases/RegenerateBackupCodesUseCase";
import { UserRepositoryDatabase } from "../../infrastructure/repositories/UserRepositoryDatabase";
import { OtpBackupCodeRepositoryDatabase } from "../../infrastructure/repositories/OtpBackupCodeRepositoryDatabase";
import { OtpService } from "../../infrastructure/services/OtpService";
import { QrCodeGenerator } from "../../infrastructure/services/QrCodeGenerator";

const router = Router();

// Créer les dépendances
const userRepository = new UserRepositoryDatabase();
const otpBackupCodeRepository = new OtpBackupCodeRepositoryDatabase();
const otpService = new OtpService();
const appName = process.env.APP_NAME || "EventHub";
const qrCodeGenerator = new QrCodeGenerator(appName, otpService);

// Créer les use cases
const generateQrCodeUseCase = new GenerateQrCodeUseCase(userRepository, qrCodeGenerator, otpService);
const enableOtpUseCase = new EnableOtpUseCase(userRepository, otpBackupCodeRepository, otpService);
const verifyOtpUseCase = new VerifyOtpUseCase(userRepository, otpBackupCodeRepository, otpService);
const disableOtpUseCase = new DisableOtpUseCase(userRepository, otpBackupCodeRepository);
const regenerateBackupCodesUseCase = new RegenerateBackupCodesUseCase(
  userRepository,
  otpBackupCodeRepository,
  otpService
);

// Créer le controller avec injection de dépendances
const a2fController = new A2fController(
  generateQrCodeUseCase,
  enableOtpUseCase,
  verifyOtpUseCase,
  disableOtpUseCase,
  regenerateBackupCodesUseCase
);

// Toutes les routes nécessitent une authentification
router.use(authenticationMiddleware);

// GET /api/a2f/qrcode - Générer le QR code pour activer l'OTP
router.get("/qrcode", (req, res, next) => a2fController.getQrCode(req, res, next));

// POST /api/a2f/enable - Activer l'OTP après vérification du code
router.post("/enable", strictOtpRateLimiter, (req, res, next) => a2fController.enableOtp(req, res, next));

// POST /api/a2f/verify - Vérifier un code OTP (pour tests)
router.post("/verify", strictOtpRateLimiter, (req, res, next) => a2fController.verifyOtp(req, res, next));

// POST /api/a2f/disable - Désactiver l'OTP
router.post("/disable", (req, res, next) => a2fController.disableOtp(req, res, next));

// GET /api/a2f/backup-codes - Récupérer les codes de secours (non implémenté pour sécurité)
router.get("/backup-codes", (req, res, next) => a2fController.getBackupCodes(req, res, next));

// POST /api/a2f/regenerate-backup-codes - Régénérer les codes de secours
router.post("/regenerate-backup-codes", (req, res, next) => a2fController.regenerateBackupCodes(req, res, next));

export { router as a2fRoutes };

