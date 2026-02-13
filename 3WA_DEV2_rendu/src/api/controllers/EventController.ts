import { Request, Response, NextFunction } from "express";
import { CreateEventUseCase, CreateEventDTO } from "../../application/usecases/CreateEventUseCase";
import { GetAllEventsUseCase } from "../../application/usecases/GetAllEventsUseCase";
import { GetPublicEventsUseCase } from "../../application/usecases/GetPublicEventsUseCase";
import { GetEventByIdUseCase } from "../../application/usecases/GetEventByIdUseCase";
import { UpdateEventUseCase, UpdateEventDTO } from "../../application/usecases/UpdateEventUseCase";
import { DeleteEventUseCase } from "../../application/usecases/DeleteEventUseCase";

export class EventController {
  constructor(
    private readonly createEventUseCase: CreateEventUseCase,
    private readonly getAllEventsUseCase: GetAllEventsUseCase,
    private readonly getPublicEventsUseCase: GetPublicEventsUseCase,
    private readonly getEventByIdUseCase: GetEventByIdUseCase,
    private readonly updateEventUseCase: UpdateEventUseCase,
    private readonly deleteEventUseCase: DeleteEventUseCase
  ) {}

  // POST /api/events
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const dto: CreateEventDTO = {
        title: req.body.title,
        description: req.body.description,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        venueId: req.body.venueId,
        capacity: req.body.capacity,
        price: req.body.price,
        organizerId: req.body.organizerId,
        categoryId: req.body.categoryId,
        imageUrl: req.body.imageUrl,
      };

      const event = await this.createEventUseCase.execute(dto);
      res.jsonSuccess(event.toJSON(), 201);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/events
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const events = await this.getAllEventsUseCase.execute();
      res.jsonSuccess(events.map((event) => event.toJSON()));
    } catch (error) {
      next(error);
    }
  }

  // GET /api/events/public
  async getPublic(req: Request, res: Response, next: NextFunction) {
    try {
      const { events } = await this.getPublicEventsUseCase.execute(2);
      res.jsonSuccess(events.map((event) => event.toJSON()));
    } catch (error) {
      next(error);
    }
  }

  // GET /api/events/:id
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const event = await this.getEventByIdUseCase.execute(id);

      if (!event) {
        return res.jsonError("Événement non trouvé", 404);
      }

      res.jsonSuccess(event.toJSON());
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/events/:id
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const dto: UpdateEventDTO = {
        id,
        title: req.body.title,
        description: req.body.description,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        venueId: req.body.venueId,
        capacity: req.body.capacity,
        price: req.body.price,
        organizerId: req.body.organizerId,
        categoryId: req.body.categoryId,
        imageUrl: req.body.imageUrl,
      };

      const event = await this.updateEventUseCase.execute(dto);
      res.jsonSuccess(event.toJSON());
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/events/:id
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await this.deleteEventUseCase.execute(id);
      res.jsonSuccess({ message: "Événement supprimé avec succès" }, 200);
    } catch (error) {
      next(error);
    }
  }
}
