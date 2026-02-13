import { OtpBackupCode } from "../entities/OtpBackupCode";

export interface OtpBackupCodeRepositoryInterface {
  save(otpBackupCode: OtpBackupCode): Promise<OtpBackupCode>;
  findByUserId(userId: string): Promise<OtpBackupCode | null>;
  update(otpBackupCode: OtpBackupCode): Promise<OtpBackupCode>;
  deleteByUserId(userId: string): Promise<void>;
}

