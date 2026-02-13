import { UserRepositoryInterface } from "../../domain/interfaces/UserRepositoryInterface";
import { OtpBackupCodeRepositoryInterface } from "../../domain/interfaces/OtpBackupCodeRepositoryInterface";

export interface DisableOtpDTO {
  userId: string;
}

export class DisableOtpUseCase {
  constructor(
    private readonly userRepository: UserRepositoryInterface,
    private readonly otpBackupCodeRepository: OtpBackupCodeRepositoryInterface
  ) {}

  async execute(dto: DisableOtpDTO): Promise<void> {
    const user = await this.userRepository.findById(dto.userId);

    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }

    // Désactiver l'OTP
    user.disableOTP();
    await this.userRepository.update(user);

    // Supprimer les codes de secours
    await this.otpBackupCodeRepository.deleteByUserId(user.id);
  }
}

