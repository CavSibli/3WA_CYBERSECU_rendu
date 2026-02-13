import { Request, Response, NextFunction } from "express";
import { AuthenticateUserUseCase } from "../../application/usecases/AuthenticateUserUseCase";
import { AuthenticateWithOtpUseCase } from "../../application/usecases/AuthenticateWithOtpUseCase";
import { CreateUserUseCase } from "../../application/usecases/CreateUserUseCase";
import { JwtService } from "../../infrastructure/services/JwtService";
import { User } from "../../domain/entities/User";

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
        secure: process.env.NODE_ENV === "production", // HTTPS en production
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
        secure: process.env.NODE_ENV === "production", // HTTPS en production
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
        secure: process.env.NODE_ENV === "production", // HTTPS en production
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
  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      // Supprimer le cookie
      res.clearCookie("authToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      res.jsonSuccess({ message: "Déconnexion réussie" });
    } catch (error) {
      next(error);
    }
  }
}


