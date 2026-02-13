import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { AuthenticateUserUseCase } from "../../application/usecases/AuthenticateUserUseCase";
import { AuthenticateWithOtpUseCase } from "../../application/usecases/AuthenticateWithOtpUseCase";
import { CreateUserUseCase } from "../../application/usecases/CreateUserUseCase";
import { UserRepositoryDatabase } from "../../infrastructure/repositories/UserRepositoryDatabase";
import { OtpBackupCodeRepositoryDatabase } from "../../infrastructure/repositories/OtpBackupCodeRepositoryDatabase";
import { OtpService } from "../../infrastructure/services/OtpService";
import { JwtService } from "../../infrastructure/services/JwtService";
import { authenticationMiddleware } from "../middlewares/authentication.middleware";
import { authRateLimiter, registerRateLimiter, strictOtpRateLimiter } from "../middlewares/rate-limit.middleware";
import { validate } from "../middlewares/validation.middleware";
import { registerSchema, loginSchema, verifyOtpSchema } from "../validators/auth.validator";

const router = Router();

// Créer les dépendances
const userRepository = new UserRepositoryDatabase();
const otpBackupCodeRepository = new OtpBackupCodeRepositoryDatabase();
const otpService = new OtpService();
const jwtService = new JwtService();

// Créer les use cases
const authenticateUserUseCase = new AuthenticateUserUseCase(userRepository);
const authenticateWithOtpUseCase = new AuthenticateWithOtpUseCase(
  userRepository,
  otpBackupCodeRepository,
  otpService
);
const createUserUseCase = new CreateUserUseCase(userRepository);

// Créer le controller avec injection de dépendances
const authController = new AuthController(
  authenticateUserUseCase,
  createUserUseCase,
  authenticateWithOtpUseCase,
  jwtService
);

router.post("/register", registerRateLimiter, validate(registerSchema), (req, res, next) => authController.register(req, res, next));
router.post("/login", authRateLimiter, validate(loginSchema), (req, res, next) => authController.login(req, res, next));
router.post("/verify-otp", strictOtpRateLimiter, validate(verifyOtpSchema), (req, res, next) => authController.verifyOtpLogin(req, res, next));
router.get("/me", authenticationMiddleware, (req, res, next) => authController.me(req, res, next));
router.post("/logout", (req, res, next) => authController.logout(req, res, next));

export { router as authRoutes };


