import { UserRepositoryInterface } from "../../domain/interfaces/UserRepositoryInterface";
import { User } from "../../domain/entities/User";
import { generateSalt, hashPassword } from "../../utility/password.utility";
import { ValidationError } from "../../shared/errors";

export interface CreateUserDTO {
  email: string;
  name: string;
  password: string;
  role?: string;
}

export interface CreateUserResult {
  user: User;
}

export class CreateUserUseCase {
  constructor(private readonly userRepository: UserRepositoryInterface) {}

  async execute(dto: CreateUserDTO): Promise<CreateUserResult> {
    // Valider le mot de passe AVANT le hash (la validation dans User attend un mot de passe en clair)
    // Minimum 8 caractères, au moins une majuscule, une minuscule, un chiffre et un caractère spécial
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(dto.password)) {
      throw new ValidationError(
        "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial (@$!%*?&)"
      );
    }

    // Toujours faire le hash pour maintenir un temps constant (protection timing attack)
    const salt = await generateSalt();
    const hashedPassword = await hashPassword(dto.password, salt);
    
    // Vérifier si l'utilisateur existe déjà (après le hash pour timing constant)
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      // Message générique pour éviter l'énumération d'utilisateurs
      throw new ValidationError("Erreur lors de l'inscription");
    }

    // Créer l'utilisateur (le mot de passe est déjà hashé, donc User ne doit pas le valider)
    const user = new User({
      email: dto.email,
      name: dto.name,
      password: hashedPassword,
      salt,
      role: dto.role || "participant",
    });

    // Sauvegarder dans la base de données
    const savedUser = await this.userRepository.save(user);

    return { user: savedUser };
  }
}

