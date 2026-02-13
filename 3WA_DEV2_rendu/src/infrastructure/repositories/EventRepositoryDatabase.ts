import { Event, EventProps } from "../../domain/entities/Event";
import { EventRepositoryInterface } from "../../domain/interfaces/EventRepositoryInterface";
import { prisma } from "../prisma/client";
import { PrismaEvent } from "../../shared/types/PrismaTypes";

export class EventRepositoryDatabase implements EventRepositoryInterface {
  async save(event: Event): Promise<Event> {
    const eventData = {
      title: event.title,
      description: event.description,
      startDate: event.startDate,
      endDate: event.endDate || null,
      venueId: event.venueId,
      capacity: event.capacity,
      price: event.price || null,
      organizerId: event.organizerId,
      categoryId: event.categoryId,
      imageUrl: event.imageUrl || null,
    };

    const savedEvent = await prisma.event.create({
      data: eventData,
    });

    return this.mapToDomain(savedEvent);
  }

  async findById(id: string): Promise<Event | null> {
    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      return null;
    }

    return this.mapToDomain(event);
  }

  async findAll(): Promise<Event[]> {
    const events = await prisma.event.findMany({
      orderBy: { startDate: "asc" },
    });

    return events.map((event) => this.mapToDomain(event));
  }

  async update(event: Event): Promise<Event> {
    const eventData = {
      title: event.title,
      description: event.description,
      startDate: event.startDate,
      endDate: event.endDate || null,
      venueId: event.venueId,
      capacity: event.capacity,
      price: event.price || null,
      organizerId: event.organizerId,
      categoryId: event.categoryId,
      imageUrl: event.imageUrl || null,
    };

    const updatedEvent = await prisma.event.update({
      where: { id: event.id },
      data: eventData,
    });

    return this.mapToDomain(updatedEvent);
  }

  async delete(id: string): Promise<void> {
    await prisma.event.delete({
      where: { id },
    });
  }

  async findByOrganizerId(organizerId: string): Promise<Event[]> {
    const events = await prisma.event.findMany({
      where: { organizerId },
      orderBy: { startDate: "asc" },
    });

    return events.map((event) => this.mapToDomain(event));
  }

  async findByCategoryId(categoryId: string): Promise<Event[]> {
    const events = await prisma.event.findMany({
      where: { categoryId },
      orderBy: { startDate: "asc" },
    });

    return events.map((event) => this.mapToDomain(event));
  }

  private mapToDomain(prismaEvent: PrismaEvent): Event {
    return new Event({
      id: prismaEvent.id,
      title: prismaEvent.title,
      description: prismaEvent.description,
      startDate: prismaEvent.startDate,
      endDate: prismaEvent.endDate || undefined,
      venueId: prismaEvent.venueId,
      capacity: prismaEvent.capacity,
      price: prismaEvent.price || undefined,
      organizerId: prismaEvent.organizerId,
      categoryId: prismaEvent.categoryId,
      imageUrl: prismaEvent.imageUrl || undefined,
      createdAt: prismaEvent.createdAt,
      updatedAt: prismaEvent.updatedAt,
    });
  }
}
