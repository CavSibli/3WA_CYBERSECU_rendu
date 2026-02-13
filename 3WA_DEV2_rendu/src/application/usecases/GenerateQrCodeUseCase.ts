import { UserRepositoryInterface } from "../../domain/interfaces/UserRepositoryInterface";
import { QrCodeGenerator } from "../../infrastructure/services/QrCodeGenerator";
import { OtpService } from "../../infrastructure/services/OtpService";

export interface GenerateQrCodeDTO {
  userId: string;
}

export interface GenerateQrCodeResult {
  qrCode: {
    image: string;
    username: string;
    secret: string;
  };
}

export class GenerateQrCodeUseCase {
  constructor(
    private readonly userRepository: UserRepositoryInterface,
    private readonly qrCodeGenerator: QrCodeGenerator,
    private readonly otpService: OtpService
  ) {}

  async execute(dto: GenerateQrCodeDTO): Promise<GenerateQrCodeResult> {
    const user = await this.userRepository.findById(dto.userId);

    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }

    // Générer un nouveau secret OTP
    const secret = this.otpService.generateSecret();

    // Générer le QR code
    const qrCode = await this.qrCodeGenerator.generate(user.email, secret);

    return { qrCode };
  }
}

