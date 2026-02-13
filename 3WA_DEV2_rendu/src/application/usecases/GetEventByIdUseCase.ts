import { Event } from "../../domain/entities/Event";
import { EventRepositoryInterface } from "../../domain/interfaces/EventRepositoryInterface";

export class GetEventByIdUseCase {
  constructor(private readonly eventRepository: EventRepositoryInterface) {}

  async execute(id: string): Promise<Event | null> {
    if (!id || id.trim() === "") {
      throw new Error("L'ID de l'événement est obligatoire");
    }
    return this.eventRepository.findById(id);
  }
}
