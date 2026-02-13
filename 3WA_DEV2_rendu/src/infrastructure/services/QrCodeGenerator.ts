import qrcode from "qrcode";
import { OtpService } from "./OtpService";

export interface QrCodeResult {
  image: string; // Base64 data URL
  username: string;
  secret: string;
}

export class QrCodeGenerator {
  constructor(
    private readonly appName: string,
    private readonly otpService: OtpService
  ) {}

  /**
   * Génère un QR code pour l'activation OTP
   */
  async generate(username: string, secret: string): Promise<QrCodeResult> {
    const keyUri = this.otpService.generateKeyUri(username, secret, this.appName);
    
    const image = await qrcode.toDataURL(keyUri, {
      errorCorrectionLevel: "M",
      type: "image/png",
      quality: 0.92,
      margin: 1,
    });

    return {
      image,
      username,
      secret,
    };
  }
}

