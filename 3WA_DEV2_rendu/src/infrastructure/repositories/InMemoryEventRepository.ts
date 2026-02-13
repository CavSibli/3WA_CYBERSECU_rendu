import { Event } from "../../domain/entities/Event";
import { EventRepositoryInterface } from "../../domain/interfaces/EventRepositoryInterface";
import { v4 as uuidv4 } from "uuid";

export class InMemoryEventRepository implements EventRepositoryInterface {
  private events: Event[] = [];

  async save(event: Event): Promise<Event> {
    const eventWithId = new Event({
      ...event.toJSON(),
      id: event.id || uuidv4(),
    });
    this.events.push(eventWithId);
    return eventWithId;
  }

  async findById(id: string): Promise<Event | null> {
    const event = this.events.find((e) => e.id === id);
    return event || null;
  }

  async findAll(): Promise<Event[]> {
    return [...this.events];
  }

  async update(event: Event): Promise<Event> {
    const index = this.events.findIndex((e) => e.id === event.id);
    if (index === -1) {
      throw new Error("Événement non trouvé");
    }
    this.events[index] = event;
    return event;
  }

  async delete(id: string): Promise<void> {
    const index = this.events.findIndex((e) => e.id === id);
    if (index === -1) {
      throw new Error("Événement non trouvé");
    }
    this.events.splice(index, 1);
  }

  async findByOrganizerId(organizerId: string): Promise<Event[]> {
    return this.events.filter((e) => e.organizerId === organizerId);
  }

  async findByCategoryId(categoryId: string): Promise<Event[]> {
    return this.events.filter((e) => e.categoryId === categoryId);
  }
}
