import { CreateEventUseCase, CreateEventDTO } from "../../application/usecases/CreateEventUseCase";
import { InMemoryEventRepository } from "../../infrastructure/repositories/InMemoryEventRepository";

describe("CreateEventUseCase", () => {
  let useCase: CreateEventUseCase;
  let repository: InMemoryEventRepository;

  // Données valides par défaut
  const validEventDTO: CreateEventDTO = {
    title: "Concert de Jazz",
    description: "Un super concert de jazz avec des artistes renommés",
    startDate: new Date(Date.now() + 86400000), // Demain
    venueId: "venue-123",
    capacity: 100,
    price: 25.0,
    organizerId: "organizer-123",
    categoryId: "category-123",
    imageUrl: "https://example.com/image.jpg",
  };

  beforeEach(() => {
    repository = new InMemoryEventRepository();
    useCase = new CreateEventUseCase(repository);
  });

  it("devrait créer un événement avec des données valides", async () => {
    const event = await useCase.execute(validEventDTO);

    expect(event).toBeDefined();
    expect(event.id).toBeDefined();
    expect(event.title).toBe(validEventDTO.title);
    expect(event.description).toBe(validEventDTO.description);
    expect(event.capacity).toBe(validEventDTO.capacity);
    expect(event.price).toBe(validEventDTO.price);
  });

  it("devrait échouer si le titre est vide", async () => {
    const invalidDTO: CreateEventDTO = {
      ...validEventDTO,
      title: "",
    };

    await expect(useCase.execute(invalidDTO)).rejects.toThrow("Le titre est obligatoire");
  });

  it("devrait échouer si le titre est composé uniquement d'espaces", async () => {
    const invalidDTO: CreateEventDTO = {
      ...validEventDTO,
      title: "   ",
    };

    await expect(useCase.execute(invalidDTO)).rejects.toThrow("Le titre est obligatoire");
  });

  it("devrait échouer si la description est vide", async () => {
    const invalidDTO: CreateEventDTO = {
      ...validEventDTO,
      description: "",
    };

    await expect(useCase.execute(invalidDTO)).rejects.toThrow("La description est obligatoire");
  });

  it("devrait échouer si la date de début est dans le passé", async () => {
    const invalidDTO: CreateEventDTO = {
      ...validEventDTO,
      startDate: new Date(Date.now() - 86400000), // Hier
    };

    await expect(useCase.execute(invalidDTO)).rejects.toThrow(
      "La date de début doit être dans le futur"
    );
  });

  it("devrait échouer si la date de fin est antérieure à la date de début", async () => {
    const invalidDTO: CreateEventDTO = {
      ...validEventDTO,
      startDate: new Date(Date.now() + 86400000), // Demain
      endDate: new Date(Date.now() - 86400000), // Hier
    };

    await expect(useCase.execute(invalidDTO)).rejects.toThrow(
      "La date de fin doit être postérieure à la date de début"
    );
  });

  it("devrait échouer si venueId est vide", async () => {
    const invalidDTO: CreateEventDTO = {
      ...validEventDTO,
      venueId: "",
    };

    await expect(useCase.execute(invalidDTO)).rejects.toThrow("Le lieu (venueId) est obligatoire");
  });

  it("devrait échouer si la capacité est négative", async () => {
    const invalidDTO: CreateEventDTO = {
      ...validEventDTO,
      capacity: -1,
    };

    await expect(useCase.execute(invalidDTO)).rejects.toThrow(
      "La capacité doit être positive (au moins 1)"
    );
  });

  it("devrait échouer si la capacité est zéro", async () => {
    const invalidDTO: CreateEventDTO = {
      ...validEventDTO,
      capacity: 0,
    };

    await expect(useCase.execute(invalidDTO)).rejects.toThrow(
      "La capacité doit être positive (au moins 1)"
    );
  });

  it("devrait échouer si le prix est négatif", async () => {
    const invalidDTO: CreateEventDTO = {
      ...validEventDTO,
      price: -10,
    };

    await expect(useCase.execute(invalidDTO)).rejects.toThrow("Le prix doit être positif ou nul");
  });

  it("devrait accepter un prix nul", async () => {
    const validDTO: CreateEventDTO = {
      ...validEventDTO,
      price: 0,
    };

    const event = await useCase.execute(validDTO);
    expect(event.price).toBe(0);
  });

  it("devrait accepter un événement sans prix (gratuit)", async () => {
    const validDTO: CreateEventDTO = {
      ...validEventDTO,
      price: undefined,
    };

    const event = await useCase.execute(validDTO);
    expect(event.price).toBeUndefined();
  });

  it("devrait échouer si organizerId est vide", async () => {
    const invalidDTO: CreateEventDTO = {
      ...validEventDTO,
      organizerId: "",
    };

    await expect(useCase.execute(invalidDTO)).rejects.toThrow(
      "L'organisateur (organizerId) est obligatoire"
    );
  });

  it("devrait échouer si categoryId est vide", async () => {
    const invalidDTO: CreateEventDTO = {
      ...validEventDTO,
      categoryId: "",
    };

    await expect(useCase.execute(invalidDTO)).rejects.toThrow(
      "La catégorie (categoryId) est obligatoire"
    );
  });

  it("devrait créer un événement sans date de fin", async () => {
    const validDTO: CreateEventDTO = {
      ...validEventDTO,
      endDate: undefined,
    };

    const event = await useCase.execute(validDTO);
    expect(event.endDate).toBeUndefined();
  });

  it("devrait créer un événement sans imageUrl", async () => {
    const validDTO: CreateEventDTO = {
      ...validEventDTO,
      imageUrl: undefined,
    };

    const event = await useCase.execute(validDTO);
    expect(event.imageUrl).toBeUndefined();
  });
});
