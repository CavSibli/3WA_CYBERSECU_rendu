export interface UserProps {
  id?: string;
  email: string;
  name: string;
  role: string;
  password: string;
  salt: string;
  otpSecret?: string;
  otpEnabled?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User {
  private props: UserProps;

  constructor(props: UserProps) {
    this.validate(props);
    this.props = {
      ...props,
      createdAt: props.createdAt || new Date(),
      updatedAt: props.updatedAt || new Date(),
    };
  }

  private validate(props: UserProps): void {
    if (!props.email || props.email.trim() === "") {
      throw new Error("L'email est obligatoire");
    }

    this.validateEmail(props.email);

    if (!props.name || props.name.trim() === "") {
      throw new Error("Le nom est obligatoire");
    }

    if (!props.password || props.password.trim() === "") {
      throw new Error("Le mot de passe est obligatoire");
    }

    this.validatePasswordStrength(props.password);

    if (!props.salt || props.salt.trim() === "") {
      throw new Error("Le sel est obligatoire");
    }

    // Validation OTP: si otpEnabled est true, otpSecret doit être présent
    if (props.otpEnabled === true && (!props.otpSecret || props.otpSecret.trim() === "")) {
      throw new Error("Le secret OTP est obligatoire lorsque l'OTP est activé");
    }
  }

  private validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Format d'email invalide");
    }
  }

  private validatePasswordStrength(password: string): void {
    // Si le mot de passe est déjà hashé (commence par $2 pour bcrypt), ne pas valider
    // La validation doit être faite avant le hash dans le use case
    if (password.startsWith('$2')) {
      return;
    }

    // Minimum 8 caractères, au moins une majuscule, une minuscule, un chiffre et un caractère spécial
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      throw new Error(
        "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial (@$!%*?&)"
      );
    }
  }

  get id(): string {
    return this.props.id || "";
  }

  get email(): string {
    return this.props.email;
  }

  get name(): string {
    return this.props.name;
  }

  get role(): string {
    return this.props.role;
  }

  get password(): string {
    return this.props.password;
  }

  get salt(): string {
    return this.props.salt;
  }

  get otpSecret(): string | undefined {
    return this.props.otpSecret;
  }

  get otpEnabled(): boolean {
    return this.props.otpEnabled || false;
  }

  get createdAt(): Date {
    return this.props.createdAt || new Date();
  }

  get updatedAt(): Date {
    return this.props.updatedAt || new Date();
  }

  enableOTP(secret: string): void {
    if (!secret || secret.trim() === "") {
      throw new Error("Le secret OTP est obligatoire");
    }
    this.props.otpSecret = secret;
    this.props.otpEnabled = true;
  }

  disableOTP(): void {
    this.props.otpSecret = undefined;
    this.props.otpEnabled = false;
  }

  toJSON() {
    return {
      id: this.props.id,
      email: this.props.email,
      name: this.props.name,
      role: this.props.role,
      otpEnabled: this.props.otpEnabled || false,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}


