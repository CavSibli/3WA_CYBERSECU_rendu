import { Event } from "../../domain/entities/Event";
import { EventRepositoryInterface } from "../../domain/interfaces/EventRepositoryInterface";
import { CreateEventDTO } from "./CreateEventUseCase";

export interface UpdateEventDTO extends Partial<CreateEventDTO> {
  id: string;
}

export class UpdateEventUseCase {
  constructor(private readonly eventRepository: EventRepositoryInterface) {}

  async execute(dto: UpdateEventDTO): Promise<Event> {
    if (!dto.id || dto.id.trim() === "") {
      throw new Error("L'ID de l'événement est obligatoire");
    }

    // Récupérer l'événement existant
    const existingEvent = await this.eventRepository.findById(dto.id);
    if (!existingEvent) {
      throw new Error("Événement non trouvé");
    }

    // Créer un nouvel événement avec les données mises à jour
    const updatedEvent = new Event({
      id: existingEvent.id,
      title: dto.title ?? existingEvent.title,
      description: dto.description ?? existingEvent.description,
      startDate: dto.startDate ? new Date(dto.startDate) : existingEvent.startDate,
      endDate: dto.endDate ? new Date(dto.endDate) : existingEvent.endDate,
      venueId: dto.venueId ?? existingEvent.venueId,
      capacity: dto.capacity ?? existingEvent.capacity,
      price: dto.price !== undefined ? dto.price : existingEvent.price,
      organizerId: dto.organizerId ?? existingEvent.organizerId,
      categoryId: dto.categoryId ?? existingEvent.categoryId,
      imageUrl: dto.imageUrl !== undefined ? dto.imageUrl : existingEvent.imageUrl,
      createdAt: existingEvent.createdAt,
      updatedAt: new Date(),
    });

    // Mettre à jour via le repository
    return this.eventRepository.update(updatedEvent);
  }
}
