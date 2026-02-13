import { UserRepositoryInterface } from "../../domain/interfaces/UserRepositoryInterface";
import { OtpBackupCodeRepositoryInterface } from "../../domain/interfaces/OtpBackupCodeRepositoryInterface";
import { OtpService } from "../../infrastructure/services/OtpService";
import { OtpBackupCode } from "../../domain/entities/OtpBackupCode";
import { OtpError, NotFoundError } from "../../shared/errors";
import bcrypt from "bcrypt";

export interface VerifyOtpDTO {
  userId: string;
  code: string;
}

export interface VerifyOtpResult {
  isValid: boolean;
  isBackupCode: boolean;
}

export class VerifyOtpUseCase {
  constructor(
    private readonly userRepository: UserRepositoryInterface,
    private readonly otpBackupCodeRepository: OtpBackupCodeRepositoryInterface,
    private readonly otpService: OtpService
  ) {}

  async execute(dto: VerifyOtpDTO): Promise<VerifyOtpResult> {
    const user = await this.userRepository.findById(dto.userId);

    if (!user) {
      throw new NotFoundError("Utilisateur non trouvé");
    }

    if (!user.otpEnabled || !user.otpSecret) {
      throw new OtpError("L'OTP n'est pas activé pour cet utilisateur");
    }

    // Vérifier d'abord si c'est un code OTP normal
    const isOtpValid = await this.otpService.verifyToken(user.otpSecret, dto.code);

    if (isOtpValid) {
      // Réinitialiser le compteur de tentatives consécutives si un code de secours existe
      const backupCodes = await this.otpBackupCodeRepository.findByUserId(user.id);
      if (backupCodes) {
        backupCodes.resetConsecutiveTests();
        await this.otpBackupCodeRepository.update(backupCodes);
      }

      return { isValid: true, isBackupCode: false };
    }

    // Si ce n'est pas un code OTP valide, vérifier si c'est un code de secours
    const backupCodes = await this.otpBackupCodeRepository.findByUserId(user.id);

    if (!backupCodes) {
      // Pas de codes de secours, retourner false
      return { isValid: false, isBackupCode: false };
    }

    // Vérifier si le code est un code de secours valide (les codes sont hashés)
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
      
      // Créer une nouvelle instance avec les codes mis à jour
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
      return { isValid: true, isBackupCode: true };
    }

    // Code invalide, incrémenter le compteur de tentatives consécutives
    backupCodes.incrementConsecutiveTests();
    await this.otpBackupCodeRepository.update(backupCodes);

    // Logger les tentatives échouées pour audit
    Logger.warn("Tentative de vérification OTP échouée", {
      userId: dto.userId,
      consecutiveTests: backupCodes.nbConsecutiveTests,
    });

    // Si trop de tentatives consécutives, on pourrait bloquer l'utilisateur (optionnel)
    if (backupCodes.nbConsecutiveTests >= 5) {
      Logger.error("Blocage utilisateur après 5 tentatives OTP échouées", {
        userId: dto.userId,
      });
      throw new OtpError("Trop de tentatives échouées. Veuillez réessayer plus tard.");
    }

    return { isValid: false, isBackupCode: false };
  }
}

