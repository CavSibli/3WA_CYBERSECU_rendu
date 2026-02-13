/**
 * Types Prisma pour remplacer les types `any` dans les repositories
 */

export interface PrismaUser {
  id: string;
  email: string;
  name: string;
  role: string;
  password: string;
  salt: string;
  otpSecret: string | null;
  otpEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PrismaOtpBackupCode {
  id: string;
  userId: string;
  codes: string; // JSON string
  nbCodeUsed: number;
  nbConsecutiveTests: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PrismaEvent {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date | null;
  venueId: string;
  capacity: number;
  price: number | null;
  organizerId: string;
  categoryId: string;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

