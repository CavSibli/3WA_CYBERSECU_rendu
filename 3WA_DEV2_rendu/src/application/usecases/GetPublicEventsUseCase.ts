import { EventRepositoryInterface } from "../../domain/interfaces/EventRepositoryInterface";
import { Event } from "../../domain/entities/Event";

export interface GetPublicEventsResult {
  events: Event[];
}

export class GetPublicEventsUseCase {
  constructor(private readonly eventRepository: EventRepositoryInterface) {}

  async execute(limit: number = 2): Promise<GetPublicEventsResult> {
    const allEvents = await this.eventRepository.findAll();
    
    // Retourner les N premiers événements (par défaut 2)
    const publicEvents = allEvents.slice(0, limit);

    return { events: publicEvents };
  }
}

