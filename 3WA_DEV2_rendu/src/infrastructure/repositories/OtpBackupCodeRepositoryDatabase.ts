import { prisma } from "../prisma/client";
import { OtpBackupCode } from "../../domain/entities/OtpBackupCode";
import { OtpBackupCodeRepositoryInterface } from "../../domain/interfaces/OtpBackupCodeRepositoryInterface";
import { PrismaOtpBackupCode } from "../../shared/types/PrismaTypes";
import bcrypt from "bcrypt";

export class OtpBackupCodeRepositoryDatabase implements OtpBackupCodeRepositoryInterface {
  /**
   * Hasher les codes de secours avec bcrypt
   */
  private async hashBackupCodes(codes: string[]): Promise<string[]> {
    return Promise.all(codes.map((code) => bcrypt.hash(code, 10)));
  }

  /**
   * Vérifier un code de secours contre les codes hashés
   */
  private async verifyBackupCode(code: string, hashedCodes: string[]): Promise<boolean> {
    for (const hashedCode of hashedCodes) {
      const isValid = await bcrypt.compare(code, hashedCode);
      if (isValid) {
        return true;
      }
    }
    return false;
  }

  async save(otpBackupCode: OtpBackupCode): Promise<OtpBackupCode> {
    // Hasher les codes avant stockage
    const hashedCodes = await this.hashBackupCodes(otpBackupCode.codes);

    const saved = await prisma.otpBackupCode.create({
      data: {
        userId: otpBackupCode.userId,
        codes: JSON.stringify(hashedCodes), // Stocker les codes hashés
        nbCodeUsed: otpBackupCode.nbCodeUsed,
        nbConsecutiveTests: otpBackupCode.nbConsecutiveTests,
      },
    });

    return this.mapToDomain(saved);
  }

  async findByUserId(userId: string): Promise<OtpBackupCode | null> {
    const otpBackupCode = await prisma.otpBackupCode.findUnique({
      where: { userId },
    });

    if (!otpBackupCode) {
      return null;
    }

    return this.mapToDomain(otpBackupCode);
  }

  async update(otpBackupCode: OtpBackupCode): Promise<OtpBackupCode> {
    if (!otpBackupCode.id) {
      throw new Error("L'ID est requis pour la mise à jour");
    }

    // Si les codes sont des strings (non hashés), les hasher
    // Sinon, ils sont déjà hashés (lors de la régénération, on passe les codes en clair)
    const codesToStore = otpBackupCode.codes.every((code) => code.startsWith("$2"))
      ? otpBackupCode.codes // Déjà hashés
      : await this.hashBackupCodes(otpBackupCode.codes); // Hasher si nécessaire

    const updated = await prisma.otpBackupCode.update({
      where: { id: otpBackupCode.id },
      data: {
        codes: JSON.stringify(codesToStore),
        nbCodeUsed: otpBackupCode.nbCodeUsed,
        nbConsecutiveTests: otpBackupCode.nbConsecutiveTests,
      },
    });

    return this.mapToDomain(updated);
  }

  async deleteByUserId(userId: string): Promise<void> {
    await prisma.otpBackupCode.deleteMany({
      where: { userId },
    });
  }

  private mapToDomain(prismaOtpBackupCode: PrismaOtpBackupCode): OtpBackupCode {
    return new OtpBackupCode({
      id: prismaOtpBackupCode.id,
      userId: prismaOtpBackupCode.userId,
      codes: JSON.parse(prismaOtpBackupCode.codes),
      nbCodeUsed: prismaOtpBackupCode.nbCodeUsed,
      nbConsecutiveTests: prismaOtpBackupCode.nbConsecutiveTests,
      createdAt: prismaOtpBackupCode.createdAt,
      updatedAt: prismaOtpBackupCode.updatedAt,
    });
  }
}

