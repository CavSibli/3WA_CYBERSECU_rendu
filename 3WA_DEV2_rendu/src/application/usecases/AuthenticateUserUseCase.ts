import { UserRepositoryInterface } from "../../domain/interfaces/UserRepositoryInterface";
import { isValidPassword, hashPassword, generateSalt } from "../../utility/password.utility";
import { User } from "../../domain/entities/User";
import { AuthenticationError } from "../../shared/errors";

export interface AuthenticateUserDTO {
  email: string;
  password: string;
}

export interface AuthenticatedUserResult {
  user: User;
  requiresOtp: boolean;
}

export class AuthenticateUserUseCase {
  constructor(private readonly userRepository: UserRepositoryInterface) {}

  async execute(dto: AuthenticateUserDTO): Promise<AuthenticatedUserResult> {
    const user = await this.userRepository.findByEmail(dto.email);

    // Toujours faire le hash pour maintenir un temps constant (protection timing attack)
    // Utiliser un hash dummy si l'utilisateur n'existe pas
    const dummySalt = await generateSalt();
  
    
    let isPasswordValid = false;
    
    if (user) {
      isPasswordValid = await isValidPassword(dto.password, user.password, user.salt);
    } else {
      // Faire un hash dummy pour maintenir le temps constant
      await hashPassword(dto.password, dummySalt);
    }

    // Message uniforme pour éviter l'énumération d'utilisateurs
    if (!user || !isPasswordValid) {
      throw new AuthenticationError("Identifiants invalides");
    }

    return { 
      user,
      requiresOtp: user.otpEnabled || false
    };
  }
}


