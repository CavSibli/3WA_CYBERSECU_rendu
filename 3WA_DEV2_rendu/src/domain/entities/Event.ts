export interface EventProps {
  id?: string;
  title: string;
  description: string;
  startDate: Date;
  endDate?: Date;
  venueId: string;
  capacity: number;
  price?: number;
  organizerId: string;
  categoryId: string;
  imageUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Event {
  private props: EventProps;

  constructor(props: EventProps) {
    this.validate(props);
    this.props = {
      ...props,
      createdAt: props.createdAt || new Date(),
      updatedAt: props.updatedAt || new Date(),
    };
  }

  private validate(props: EventProps): void {
    // Validation du titre
    if (!props.title || props.title.trim() === "") {
      throw new Error("Le titre est obligatoire");
    }

    // Validation de la description
    if (!props.description || props.description.trim() === "") {
      throw new Error("La description est obligatoire");
    }

    // Validation de la date de début
    if (!props.startDate) {
      throw new Error("La date de début est obligatoire");
    }

    const startDate = new Date(props.startDate);
    const now = new Date();
    if (startDate <= now) {
      throw new Error("La date de début doit être dans le futur");
    }

    // Validation de la date de fin si fournie
    if (props.endDate) {
      const endDate = new Date(props.endDate);
      if (endDate <= startDate) {
        throw new Error("La date de fin doit être postérieure à la date de début");
      }
    }

    // Validation du lieu
    if (!props.venueId || props.venueId.trim() === "") {
      throw new Error("Le lieu (venueId) est obligatoire");
    }

    // Validation de la capacité
    if (!props.capacity || props.capacity < 1) {
      throw new Error("La capacité doit être positive (au moins 1)");
    }

    // Validation du prix si fourni
    if (props.price !== undefined && props.price !== null) {
      if (props.price < 0) {
        throw new Error("Le prix doit être positif ou nul");
      }
    }

    // Validation de l'organisateur
    if (!props.organizerId || props.organizerId.trim() === "") {
      throw new Error("L'organisateur (organizerId) est obligatoire");
    }

    // Validation de la catégorie
    if (!props.categoryId || props.categoryId.trim() === "") {
      throw new Error("La catégorie (categoryId) est obligatoire");
    }
  }

  // Getters
  get id(): string {
    return this.props.id || "";
  }

  get title(): string {
    return this.props.title;
  }

  get description(): string {
    return this.props.description;
  }

  get startDate(): Date {
    return this.props.startDate;
  }

  get endDate(): Date | undefined {
    return this.props.endDate;
  }

  get venueId(): string {
    return this.props.venueId;
  }

  get capacity(): number {
    return this.props.capacity;
  }

  get price(): number | undefined {
    return this.props.price;
  }

  get organizerId(): string {
    return this.props.organizerId;
  }

  get categoryId(): string {
    return this.props.categoryId;
  }

  get imageUrl(): string | undefined {
    return this.props.imageUrl;
  }

  get createdAt(): Date {
    return this.props.createdAt || new Date();
  }

  get updatedAt(): Date {
    return this.props.updatedAt || new Date();
  }

  // Méthode pour obtenir toutes les propriétés
  toJSON(): EventProps {
    return {
      id: this.props.id,
      title: this.props.title,
      description: this.props.description,
      startDate: this.props.startDate,
      endDate: this.props.endDate,
      venueId: this.props.venueId,
      capacity: this.props.capacity,
      price: this.props.price,
      organizerId: this.props.organizerId,
      categoryId: this.props.categoryId,
      imageUrl: this.props.imageUrl,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
