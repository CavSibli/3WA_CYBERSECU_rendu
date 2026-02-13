import { UserRepositoryInterface } from "../../domain/interfaces/UserRepositoryInterface";
import { OtpBackupCodeRepositoryInterface } from "../../domain/interfaces/OtpBackupCodeRepositoryInterface";
import { OtpService } from "../../infrastructure/services/OtpService";
import { OtpBackupCode } from "../../domain/entities/OtpBackupCode";

export interface EnableOtpDTO {
  userId: string;
  secret: string;
  verificationCode: string;
}

export interface EnableOtpResult {
  backupCodes: string[];
}

export class EnableOtpUseCase {
  constructor(
    private readonly userRepository: UserRepositoryInterface,
    private readonly otpBackupCodeRepository: OtpBackupCodeRepositoryInterface,
    private readonly otpService: OtpService
  ) {}

  async execute(dto: EnableOtpDTO): Promise<EnableOtpResult> {
    const user = await this.userRepository.findById(dto.userId);

    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }

    // Vérifier le code de vérification
    const isValid = await this.otpService.verifyToken(dto.secret, dto.verificationCode);

    if (!isValid) {
      throw new Error("Code de vérification invalide");
    }

    // Activer l'OTP pour l'utilisateur
    user.enableOTP(dto.secret);
    await this.userRepository.update(user);

    // Supprimer les anciens codes de secours s'ils existent (au cas où l'OTP a été réactivé)
    await this.otpBackupCodeRepository.deleteByUserId(user.id);

    // Générer les codes de secours
    const backupCodes = this.otpService.generateBackupCodes(8);

    // Sauvegarder les codes de secours
    const otpBackupCode = new OtpBackupCode({
      userId: user.id,
      codes: backupCodes,
      nbCodeUsed: 0,
      nbConsecutiveTests: 0,
    });

    await this.otpBackupCodeRepository.save(otpBackupCode);

    return { backupCodes };
  }
}

