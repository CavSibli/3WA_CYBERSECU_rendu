/**
 * @swagger
 * components:
 *   schemas:
 *     CreateEventInput:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - startDate
 *         - venueId
 *         - capacity
 *         - organizerId
 *         - categoryId
 *       properties:
 *         title:
 *           type: string
 *           description: Titre de l'événement
 *           example: "Concert de Jazz"
 *         description:
 *           type: string
 *           description: Description de l'événement
 *           example: "Un super concert de jazz avec des artistes renommés"
 *         startDate:
 *           type: string
 *           format: date-time
 *           description: Date et heure de début de l'événement
 *           example: "2026-02-15T20:00:00Z"
 *         endDate:
 *           type: string
 *           format: date-time
 *           description: Date et heure de fin de l'événement (optionnel)
 *           example: "2026-02-15T23:00:00Z"
 *         venueId:
 *           type: string
 *           description: ID du lieu de l'événement
 *           example: "venue-123"
 *         capacity:
 *           type: integer
 *           description: Capacité maximale de l'événement
 *           example: 100
 *           minimum: 1
 *         price:
 *           type: number
 *           format: float
 *           description: Prix de l'événement (optionnel, 0 pour gratuit)
 *           example: 25.0
 *           minimum: 0
 *         organizerId:
 *           type: string
 *           description: ID de l'organisateur
 *           example: "organizer-123"
 *         categoryId:
 *           type: string
 *           description: ID de la catégorie
 *           example: "category-123"
 *         imageUrl:
 *           type: string
 *           format: uri
 *           description: URL de l'image de l'événement (optionnel)
 *           example: "https://example.com/image.jpg"
 *
 *     Event:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID unique de l'événement
 *           example: "event-123"
 *         title:
 *           type: string
 *           example: "Concert de Jazz"
 *         description:
 *           type: string
 *           example: "Un super concert de jazz"
 *         startDate:
 *           type: string
 *           format: date-time
 *           example: "2026-02-15T20:00:00Z"
 *         endDate:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: "2026-02-15T23:00:00Z"
 *         venueId:
 *           type: string
 *           example: "venue-123"
 *         capacity:
 *           type: integer
 *           example: 100
 *         price:
 *           type: number
 *           nullable: true
 *           example: 25.0
 *         organizerId:
 *           type: string
 *           example: "organizer-123"
 *         categoryId:
 *           type: string
 *           example: "category-123"
 *         imageUrl:
 *           type: string
 *           nullable: true
 *           example: "https://example.com/image.jpg"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2026-01-15T10:00:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2026-01-15T10:00:00Z"
 *
 *     EventResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Event'
 *
 *     EventsResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Event'
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         data:
 *           type: object
 *           nullable: true
 *         error:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               example: "Une erreur s'est produite"
 *             code:
 *               type: integer
 *               example: 400
 */
