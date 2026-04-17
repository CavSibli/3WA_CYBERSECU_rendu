import { CreateEventUseCase, CreateEventDTO } from "../../application/usecases/CreateEventUseCase";
import { GetPublicEventsUseCase } from "../../application/usecases/GetPublicEventsUseCase";
import { InMemoryEventRepository } from "../../infrastructure/repositories/InMemoryEventRepository";

describe("GetPublicEventsUseCase", () => {
  let repository: InMemoryEventRepository;
  let createEventUseCase: CreateEventUseCase;
  let getPublicEventsUseCase: GetPublicEventsUseCase;

  const buildValidEventDTO = (
    overrides: Partial<CreateEventDTO> = {},
    dayOffset: number = 1
  ): CreateEventDTO => ({
    title: "Event title",
    description: "Event description",
    startDate: new Date(Date.now() + dayOffset * 86400000),
    venueId: "venue-123",
    capacity: 100,
    price: 10,
    organizerId: "organizer-123",
    categoryId: "category-123",
    imageUrl: "https://example.com/event.jpg",
    ...overrides,
  });

  beforeEach(() => {
    repository = new InMemoryEventRepository();
    createEventUseCase = new CreateEventUseCase(repository);
    getPublicEventsUseCase = new GetPublicEventsUseCase(repository);
  });

  it("retourne les 2 premiers événements par défaut", async () => {
    await createEventUseCase.execute(buildValidEventDTO({ title: "Event A" }, 1));
    await createEventUseCase.execute(buildValidEventDTO({ title: "Event B" }, 2));
    await createEventUseCase.execute(buildValidEventDTO({ title: "Event C" }, 3));

    const { events } = await getPublicEventsUseCase.execute();

    expect(events).toHaveLength(2);
    expect(events[0].title).toBe("Event A");
    expect(events[1].title).toBe("Event B");
  });

  it("respecte une limite personnalisée", async () => {
    await createEventUseCase.execute(buildValidEventDTO({ title: "Event A" }, 1));
    await createEventUseCase.execute(buildValidEventDTO({ title: "Event B" }, 2));
    await createEventUseCase.execute(buildValidEventDTO({ title: "Event C" }, 3));

    const { events } = await getPublicEventsUseCase.execute(1);

    expect(events).toHaveLength(1);
    expect(events[0].title).toBe("Event A");
  });

  it("retourne tous les événements si la limite dépasse le total", async () => {
    await createEventUseCase.execute(buildValidEventDTO({ title: "Event A" }, 1));
    await createEventUseCase.execute(buildValidEventDTO({ title: "Event B" }, 2));

    const { events } = await getPublicEventsUseCase.execute(3);

    expect(events).toHaveLength(2);
    expect(events.map((event) => event.title)).toEqual(["Event A", "Event B"]);
  });

  it("retourne un tableau vide quand aucun événement n'existe", async () => {
    const { events } = await getPublicEventsUseCase.execute();

    expect(events).toHaveLength(0);
  });
});
