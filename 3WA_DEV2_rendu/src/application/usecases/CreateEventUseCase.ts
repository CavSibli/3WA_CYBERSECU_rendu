import { Event} from "../../domain/entities/Event";
import { EventRepositoryInterface } from "../../domain/interfaces/EventRepositoryInterface";

export interface CreateEventDTO {
  title: string;
  description: string;
  startDate: Date | string;
  endDate?: Date | string;
  venueId: string;
  capacity: number;
  price?: number;
  organizerId: string;
  categoryId: string;
  imageUrl?: string;
}

export class CreateEventUseCase {
  constructor(private readonly eventRepository: EventRepositoryInterface) {}

  async execute(dto: CreateEventDTO): Promise<Event> {
    // Créer l'entité (les validations sont faites dans le constructeur)
    const event = new Event({
      title: dto.title,
      description: dto.description,
      startDate: new Date(dto.startDate),
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      venueId: dto.venueId,
      capacity: dto.capacity,
      price: dto.price,
      organizerId: dto.organizerId,
      categoryId: dto.categoryId,
      imageUrl: dto.imageUrl,
    });

    // Sauvegarder via le repository
    return this.eventRepository.save(event);
  }
}
