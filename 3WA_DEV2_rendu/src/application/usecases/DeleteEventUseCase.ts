import { EventRepositoryInterface } from "../../domain/interfaces/EventRepositoryInterface";

export class DeleteEventUseCase {
  constructor(private readonly eventRepository: EventRepositoryInterface) {}

  async execute(id: string): Promise<void> {
    if (!id || id.trim() === "") {
      throw new Error("L'ID de l'événement est obligatoire");
    }

    // Vérifier que l'événement existe
    const event = await this.eventRepository.findById(id);
    if (!event) {
      throw new Error("Événement non trouvé");
    }

    // Supprimer via le repository
    await this.eventRepository.delete(id);
  }
}
