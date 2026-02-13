import { prisma } from "../prisma/client";
import { User } from "../../domain/entities/User";
import { UserRepositoryInterface } from "../../domain/interfaces/UserRepositoryInterface";
import { PrismaUser } from "../../shared/types/PrismaTypes";

export class UserRepositoryDatabase implements UserRepositoryInterface {
  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }

    return this.mapToDomain(user);
  }

  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return null;
    }

    return this.mapToDomain(user);
  }

  async save(user: User): Promise<User> {
    const userData: Partial<PrismaUser> = {
      email: user.email,
      name: user.name,
      role: user.role,
      password: user.password,
      salt: user.salt,
    };

    // Ajouter les champs OTP seulement s'ils sont définis
    if (user.otpSecret !== undefined) {
      userData.otpSecret = user.otpSecret;
    }
    if (user.otpEnabled !== undefined) {
      userData.otpEnabled = user.otpEnabled;
    }

    const savedUser = await prisma.user.create({
      data: userData,
    });

    return this.mapToDomain(savedUser);
  }

  async update(user: User): Promise<User> {
    if (!user.id) {
      throw new Error("L'ID est requis pour la mise à jour");
    }

    const userData: Partial<PrismaUser> = {
      email: user.email,
      name: user.name,
      role: user.role,
      password: user.password,
      salt: user.salt,
    };

    // Ajouter les champs OTP seulement s'ils sont définis
    if (user.otpSecret !== undefined) {
      userData.otpSecret = user.otpSecret;
    }
    if (user.otpEnabled !== undefined) {
      userData.otpEnabled = user.otpEnabled;
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: userData,
    });

    return this.mapToDomain(updatedUser);
  }

  private mapToDomain(prismaUser: PrismaUser): User {
    return new User({
      id: prismaUser.id,
      email: prismaUser.email,
      name: prismaUser.name,
      role: prismaUser.role,
      password: prismaUser.password,
      salt: prismaUser.salt,
      otpSecret: prismaUser.otpSecret || undefined,
      otpEnabled: prismaUser.otpEnabled || false,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
    });
  }
}


