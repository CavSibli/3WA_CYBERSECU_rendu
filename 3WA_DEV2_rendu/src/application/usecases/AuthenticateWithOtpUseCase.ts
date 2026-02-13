import { UserRepositoryInterface } from "../../domain/interfaces/UserRepositoryInterface";
import { OtpBackupCodeRepositoryInterface } from "../../domain/interfaces/OtpBackupCodeRepositoryInterface";
import { OtpService } from "../../infrastructure/services/OtpService";
import { isValidPassword } from "../../utility/password.utility";
import { User } from "../../domain/entities/User";
import { OtpBackupCode } from "../../domain/entities/OtpBackupCode";
import { AuthenticationError, OtpError } from "../../shared/errors";
import bcrypt from "bcrypt";

export interface AuthenticateWithOtpDTO {
  email: string;
  password: string;
  code: string;
}

export interface AuthenticateWithOtpResult {
  user: User;
}

export class AuthenticateWithOtpUseCase {
  constructor(
    private readonly userRepository: UserRepositoryInterface,
    private readonly otpBackupCodeRepository: OtpBackupCodeRepositoryInterface,
    private readonly otpService: OtpService
  ) {}

  async execute(dto: AuthenticateWithOtpDTO): Promise<AuthenticateWithOtpResult> {
    const user = await this.userRepository.findByEmail(dto.email);

    if (!user) {
      throw new AuthenticationError("Identifiants invalides");
    }

    // Vérifier le mot de passe
    const isPasswordValid = await isValidPassword(dto.password, user.password, user.salt);

    if (!isPasswordValid) {
      throw new AuthenticationError("Identifiants invalides");
    }

    // Vérifier que l'OTP est activé
    if (!user.otpEnabled || !user.otpSecret) {
      throw new OtpError("L'OTP n'est pas activé pour cet utilisateur");
    }

    // Vérifier le code OTP ou code de secours
    const isOtpValid = await this.otpService.verifyToken(user.otpSecret, dto.code);

    if (isOtpValid) {
      // Réinitialiser le compteur de tentatives consécutives si un code de secours existe
      const backupCodes = await this.otpBackupCodeRepository.findByUserId(user.id);
      if (backupCodes) {
        backupCodes.resetConsecutiveTests();
        await this.otpBackupCodeRepository.update(backupCodes);
      }

      return { user };
    }

    // Vérifier si c'est un code de secours (les codes sont hashés)
    const backupCodes = await this.otpBackupCodeRepository.findByUserId(user.id);

    if (backupCodes) {
      const hashedCodes = backupCodes.codes; // Les codes sont déjà hashés depuis la DB
      let matchedIndex = -1;
      
      for (let i = 0; i < hashedCodes.length; i++) {
        const isValid = await bcrypt.compare(dto.code, hashedCodes[i]);
        if (isValid) {
          matchedIndex = i;
          break;
        }
      }

      if (matchedIndex !== -1) {
        // Code valide, retirer le code utilisé
        const updatedCodes = [...hashedCodes];
        updatedCodes.splice(matchedIndex, 1);
        
        const updatedBackupCodes = new OtpBackupCode({
          id: backupCodes.id,
          userId: backupCodes.userId,
          codes: updatedCodes,
          nbCodeUsed: backupCodes.nbCodeUsed + 1,
          nbConsecutiveTests: 0, // Reset
          createdAt: backupCodes.createdAt,
          updatedAt: backupCodes.updatedAt,
        });
        
        await this.otpBackupCodeRepository.update(updatedBackupCodes);
        return { user };
      }

      // Code invalide, incrémenter le compteur
      backupCodes.incrementConsecutiveTests();
      await this.otpBackupCodeRepository.update(backupCodes);

      if (backupCodes.nbConsecutiveTests >= 5) {
        throw new OtpError("Trop de tentatives échouées. Veuillez réessayer plus tard.");
      }
    }

    throw new OtpError("Code OTP invalide");
  }
}

