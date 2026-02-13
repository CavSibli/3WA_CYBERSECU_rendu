import { UserRepositoryInterface } from "../../domain/interfaces/UserRepositoryInterface";
import { OtpBackupCodeRepositoryInterface } from "../../domain/interfaces/OtpBackupCodeRepositoryInterface";
import { OtpService } from "../../infrastructure/services/OtpService";
import { OtpBackupCode } from "../../domain/entities/OtpBackupCode";

export interface RegenerateBackupCodesDTO {
  userId: string;
}

export interface RegenerateBackupCodesResult {
  backupCodes: string[];
}

export class RegenerateBackupCodesUseCase {
  constructor(
    private readonly userRepository: UserRepositoryInterface,
    private readonly otpBackupCodeRepository: OtpBackupCodeRepositoryInterface,
    private readonly otpService: OtpService
  ) {}

  async execute(dto: RegenerateBackupCodesDTO): Promise<RegenerateBackupCodesResult> {
    const user = await this.userRepository.findById(dto.userId);

    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }

    if (!user.otpEnabled) {
      throw new Error("L'OTP n'est pas activé pour cet utilisateur");
    }

    // Générer de nouveaux codes de secours
    const backupCodes = this.otpService.generateBackupCodes(8);

    // Récupérer ou créer l'entité OtpBackupCode
    let otpBackupCode = await this.otpBackupCodeRepository.findByUserId(user.id);

    if (otpBackupCode) {
      // Mettre à jour les codes existants
      otpBackupCode = new OtpBackupCode({
        id: otpBackupCode.id,
        userId: user.id,
        codes: backupCodes,
        nbCodeUsed: 0,
        nbConsecutiveTests: 0,
        createdAt: otpBackupCode.createdAt,
        updatedAt: new Date(),
      });
      await this.otpBackupCodeRepository.update(otpBackupCode);
    } else {
      // Créer une nouvelle entité
      otpBackupCode = new OtpBackupCode({
        userId: user.id,
        codes: backupCodes,
        nbCodeUsed: 0,
        nbConsecutiveTests: 0,
      });
      await this.otpBackupCodeRepository.save(otpBackupCode);
    }

    return { backupCodes };
  }
}

