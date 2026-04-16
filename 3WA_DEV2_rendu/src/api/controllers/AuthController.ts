import { Request, Response, NextFunction } from "express";
import { AuthenticateUserUseCase } from "../../application/usecases/AuthenticateUserUseCase";
import { AuthenticateWithOtpUseCase } from "../../application/usecases/AuthenticateWithOtpUseCase";
import { CreateUserUseCase } from "../../application/usecases/CreateUserUseCase";
import { JwtService } from "../../infrastructure/services/JwtService";
import { User } from "../../domain/entities/User";
import { isHttpsRequest } from "../../utility/utils";

export class AuthController {
  constructor(
    private readonly authenticateUserUseCase: AuthenticateUserUseCase,
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly authenticateWithOtpUseCase: AuthenticateWithOtpUseCase,
    private readonly jwtService: JwtService
  ) {}

  /**
   * Helper pour construire l'objet user formaté pour les réponses API
   */
  private buildUserResponse(user: User) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }

  // POST /api/auth/login
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      // #region agent log
      fetch("http://127.0.0.1:7723/ingest/3e757b8c-e55b-48a6-b819-71791092e113", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Debug-Session-Id": "432427",
        },
        body: JSON.stringify({
          sessionId: "432427",
          runId: "auth-500-debug",
          hypothesisId: "H9",
          location: "src/api/controllers/AuthController.ts:33",
          message: "Auth login request",
          data: {
            hasEmail: typeof email === "string",
            hasPassword: typeof password === "string",
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion

      const { user, requiresOtp } = await this.authenticateUserUseCase.execute({ email, password });

      // Si OTP est requis, retourner un token temporaire
      if (requiresOtp) {
        const tempToken = this.jwtService.generateTempToken({
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        });

        return res.jsonSuccess({
          requiresOtp: true,
          tempToken,
          user: this.buildUserResponse(user),
        });
      }

      // Si OTP n'est pas requis, retourner le token final dans un cookie httpOnly
      const token = this.jwtService.generateToken({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });

      // Définir le token dans un cookie httpOnly
      res.cookie("authToken", token, {
        httpOnly: true,
        secure: isHttpsRequest(req),
        sameSite: "strict",
        maxAge: 60 * 60 * 1000, // 1 heure
      });

      res.jsonSuccess({
        user: this.buildUserResponse(user),
        requiresOtp: false,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/auth/verify-otp
  async verifyOtpLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, code } = req.body;

      const { user } = await this.authenticateWithOtpUseCase.execute({
        email,
        password,
        code,
      });

      const token = this.jwtService.generateToken({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });

      // Définir le token dans un cookie httpOnly
      res.cookie("authToken", token, {
        httpOnly: true,
        secure: isHttpsRequest(req),
        sameSite: "strict",
        maxAge: 60 * 60 * 1000, // 1 heure
      });

      res.jsonSuccess({
        user: this.buildUserResponse(user),
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/auth/register
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, name, password, role } = req.body;

      // #region agent log
      fetch("http://127.0.0.1:7723/ingest/3e757b8c-e55b-48a6-b819-71791092e113", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Debug-Session-Id": "432427",
        },
        body: JSON.stringify({
          sessionId: "432427",
          runId: "auth-500-debug",
          hypothesisId: "H10",
          location: "src/api/controllers/AuthController.ts:125",
          message: "Auth register request",
          data: {
            hasEmail: typeof email === "string",
            hasName: typeof name === "string",
            hasPassword: typeof password === "string",
            hasRole: typeof role === "string",
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion

      const { user } = await this.createUserUseCase.execute({
        email,
        name,
        password,
        role,
      });

      const token = this.jwtService.generateToken({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });

      // Définir le token dans un cookie httpOnly
      res.cookie("authToken", token, {
        httpOnly: true,
        secure: isHttpsRequest(req),
        sameSite: "strict",
        maxAge: 60 * 60 * 1000, // 1 heure
      });

      res.jsonSuccess(
        {
          user: this.buildUserResponse(user),
        },
        201
      );
    } catch (error) {
      next(error);
    }
  }

  // GET /api/auth/me
  async me(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.jsonError("Non authentifié", 401);
      }

      res.jsonSuccess(req.user);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/auth/logout
  async logout(_req: Request, res: Response, next: NextFunction) {
    try {
      // Supprimer le cookie
      res.clearCookie("authToken", {
        httpOnly: true,
        secure: isHttpsRequest(_req),
        sameSite: "strict",
      });

      res.jsonSuccess({ message: "Déconnexion réussie" });
    } catch (error) {
      next(error);
    }
  }
}


