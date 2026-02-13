import { Router } from "express";
import { EventController } from "../controllers/EventController";
import { CreateEventUseCase } from "../../application/usecases/CreateEventUseCase";
import { GetAllEventsUseCase } from "../../application/usecases/GetAllEventsUseCase";
import { GetPublicEventsUseCase } from "../../application/usecases/GetPublicEventsUseCase";
import { GetEventByIdUseCase } from "../../application/usecases/GetEventByIdUseCase";
import { UpdateEventUseCase } from "../../application/usecases/UpdateEventUseCase";
import { DeleteEventUseCase } from "../../application/usecases/DeleteEventUseCase";
import { EventRepositoryDatabase } from "../../infrastructure/repositories/EventRepositoryDatabase";
import { authenticationMiddleware } from "../middlewares/authentication.middleware";

const router = Router();

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Créer un nouvel événement
 *     description: Permet de créer un nouvel événement avec toutes les informations requises
 *     tags:
 *       - Events
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateEventInput'
 *     responses:
 *       201:
 *         description: Événement créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EventResponse'
 *       400:
 *         description: Données de requête invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 *   get:
 *     summary: Lister tous les événements
 *     description: Récupère la liste de tous les événements
 *     tags:
 *       - Events
 *     responses:
 *       200:
 *         description: Liste des événements récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EventsResponse'
 */

/**
 * @swagger
 * /events/{id}:
 *   get:
 *     summary: Récupérer un événement par son ID
 *     description: Récupère les détails d'un événement spécifique
 *     tags:
 *       - Events
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'événement
 *     responses:
 *       200:
 *         description: Événement récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EventResponse'
 *       404:
 *         description: Événement non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 *   put:
 *     summary: Modifier un événement
 *     description: Met à jour les informations d'un événement existant
 *     tags:
 *       - Events
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'événement
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateEventInput'
 *     responses:
 *       200:
 *         description: Événement modifié avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EventResponse'
 *       404:
 *         description: Événement non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       400:
 *         description: Données de requête invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 *   delete:
 *     summary: Supprimer un événement
 *     description: Supprime un événement de la base de données
 *     tags:
 *       - Events
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'événement
 *     responses:
 *       200:
 *         description: Événement supprimé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Événement supprimé avec succès"
 *       404:
 *         description: Événement non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

// Initialiser les dépendances
const eventRepository = new EventRepositoryDatabase();
const createEventUseCase = new CreateEventUseCase(eventRepository);
const getAllEventsUseCase = new GetAllEventsUseCase(eventRepository);
const getPublicEventsUseCase = new GetPublicEventsUseCase(eventRepository);
const getEventByIdUseCase = new GetEventByIdUseCase(eventRepository);
const updateEventUseCase = new UpdateEventUseCase(eventRepository);
const deleteEventUseCase = new DeleteEventUseCase(eventRepository);

const eventController = new EventController(
  createEventUseCase,
  getAllEventsUseCase,
  getPublicEventsUseCase,
  getEventByIdUseCase,
  updateEventUseCase,
  deleteEventUseCase
);

// Routes publiques
router.get("/public", (req, res, next) => eventController.getPublic(req, res, next));

// Routes protégées (dashboard, gestion des événements)
router.post("/", authenticationMiddleware, (req, res, next) => eventController.create(req, res, next));
router.get("/", authenticationMiddleware, (req, res, next) => eventController.getAll(req, res, next));
router.get("/:id", authenticationMiddleware, (req, res, next) => eventController.getById(req, res, next));
router.put("/:id", authenticationMiddleware, (req, res, next) => eventController.update(req, res, next));
router.delete("/:id", authenticationMiddleware, (req, res, next) => eventController.delete(req, res, next));

export { router as eventRoutes };
