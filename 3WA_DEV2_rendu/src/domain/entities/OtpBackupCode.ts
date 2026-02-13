export interface OtpBackupCodeProps {
  id?: string;
  userId: string;
  codes: string[];
  nbCodeUsed: number;
  nbConsecutiveTests: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class OtpBackupCode {
  private props: OtpBackupCodeProps;

  constructor(props: OtpBackupCodeProps) {
    this.validate(props);
    this.props = {
      ...props,
      createdAt: props.createdAt || new Date(),
      updatedAt: props.updatedAt || new Date(),
    };
  }

  private validate(props: OtpBackupCodeProps): void {
    if (!props.userId || props.userId.trim() === "") {
      throw new Error("L'ID utilisateur est obligatoire");
    }

    if (!props.codes || !Array.isArray(props.codes) || props.codes.length === 0) {
      throw new Error("Les codes de secours sont obligatoires");
    }

    if (typeof props.nbCodeUsed !== "number" || props.nbCodeUsed < 0) {
      throw new Error("Le nombre de codes utilisés doit être un nombre positif");
    }

    if (typeof props.nbConsecutiveTests !== "number" || props.nbConsecutiveTests < 0) {
      throw new Error("Le nombre de tentatives consécutives doit être un nombre positif");
    }
  }

  get id(): string {
    return this.props.id || "";
  }

  get userId(): string {
    return this.props.userId;
  }

  get codes(): string[] {
    return this.props.codes;
  }

  get nbCodeUsed(): number {
    return this.props.nbCodeUsed;
  }

  get nbConsecutiveTests(): number {
    return this.props.nbConsecutiveTests;
  }

  get createdAt(): Date {
    return this.props.createdAt || new Date();
  }

  get updatedAt(): Date {
    return this.props.updatedAt || new Date();
  }

  useCode(code: string): boolean {
    const codeIndex = this.props.codes.indexOf(code);
    if (codeIndex === -1) {
      this.incrementConsecutiveTests();
      return false;
    }

    // Retirer le code utilisé
    this.props.codes.splice(codeIndex, 1);
    this.props.nbCodeUsed += 1;
    this.resetConsecutiveTests();
    return true;
  }

  incrementConsecutiveTests(): void {
    this.props.nbConsecutiveTests += 1;
  }

  resetConsecutiveTests(): void {
    this.props.nbConsecutiveTests = 0;
  }

  toJSON() {
    return {
      id: this.props.id,
      userId: this.props.userId,
      codes: this.props.codes,
      nbCodeUsed: this.props.nbCodeUsed,
      nbConsecutiveTests: this.props.nbConsecutiveTests,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}

