# EventHub Backend API

Backend API pour EventHub - Système de gestion d'événements développé avec TypeScript, Express, Prisma et PostgreSQL.

## 📋 Table des matières

- [Architecture](#architecture)
- [Technologies](#technologies)
- [Installation](#installation)
- [Configuration](#configuration)
- [Utilisation](#utilisation)
- [API Endpoints](#api-endpoints)
- [Tests](#tests)
- [Documentation Swagger](#documentation-swagger)
- [Structure du projet](#structure-du-projet)

## 🏗️ Architecture

Ce projet suit l'**architecture Onion (Clean Architecture)** avec 4 couches distinctes :

1. **Domain** : Entités et interfaces (ne dépend de rien)
2. **Application** : Use Cases (orchestration de la logique métier)
3. **Infrastructure** : Repositories (implémentation Prisma)
4. **API** : Controllers et Routes (gestion HTTP)

### Design Patterns implémentés

- **Repository Pattern** : Abstraction de l'accès aux données
- **Dependency Injection** : Injection des dépendances dans les Use Cases
- **DTO Pattern** : Transfert de données entre les couches
- **Onion Architecture** : Séparation en couches avec dépendances vers l'intérieur

## 🛠️ Technologies

- **TypeScript** : Langage de programmation
- **Express.js** : Framework web
- **Prisma** : ORM pour PostgreSQL
- **PostgreSQL** : Base de données relationnelle
- **Jest** : Framework de tests
- **Swagger** : Documentation API
- **Docker** : Containerisation de PostgreSQL

## 📦 Installation

### Prérequis

- Node.js (v18 ou supérieur)
- Docker et Docker Compose
- npm ou yarn

### Étapes d'installation

1. **Cloner le projet** (si applicable) ou naviguer dans le dossier `eventhub_back`

2. **Installer les dépendances**

```bash
npm install
```

3. **Démarrer PostgreSQL avec Docker**

```bash
docker-compose up -d
```

4. **Configurer les variables d'environnement**

Créez un fichier `.env` à la racine du projet :

```env
DATABASE_URL="postgresql://user:password@localhost:5432/eventhub"
JWT_SECRET="your-secret-key-change-in-production"
PORT=8000
NODE_ENV=development
```

5. **Initialiser la base de données**

```bash
# Générer le client Prisma
npx prisma generate

# Créer les migrations
npx prisma migrate dev --name init

# Remplir la base de données avec des données de test
npm run seed
```

## ⚙️ Configuration

### Variables d'environnement

| Variable | Description | Exemple |
|----------|-------------|---------|
| `DATABASE_URL` | URL de connexion PostgreSQL | `postgresql://user:password@localhost:5432/eventhub` |
| `JWT_SECRET` | Clé secrète pour JWT | `your-secret-key` |
| `PORT` | Port du serveur | `8000` |
| `NODE_ENV` | Environnement | `development` ou `production` |

## 🚀 Utilisation

### Démarrer le serveur

```bash
npm start
```

Le serveur sera accessible sur `http://localhost:8000`

### Scripts disponibles

```bash
# Démarrer le serveur en mode développement
npm start

# Compiler TypeScript
npm run build

# Exécuter les tests
npm test

# Exécuter les tests en mode watch
npm run test:watch

# Remplir la base de données
npm run seed

# Générer la documentation Swagger
npm run swagger:generate

# Valider la documentation Swagger
npm run swagger:validate
```

## 📡 API Endpoints

### Base URL

```
http://localhost:8000/api
```

### Endpoints disponibles

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/events` | Lister tous les événements |
| `GET` | `/events/:id` | Récupérer un événement par ID |
| `POST` | `/events` | Créer un nouvel événement |
| `PUT` | `/events/:id` | Modifier un événement |
| `DELETE` | `/events/:id` | Supprimer un événement |

### Exemple de requête

**Créer un événement**

```bash
POST http://localhost:8000/api/events
Content-Type: application/json

{
  "title": "Concert de Jazz",
  "description": "Un super concert de jazz",
  "startDate": "2026-02-15T20:00:00Z",
  "endDate": "2026-02-15T23:00:00Z",
  "venueId": "venue-123",
  "capacity": 100,
  "price": 25.0,
  "organizerId": "organizer-123",
  "categoryId": "category-123",
  "imageUrl": "https://example.com/image.jpg"
}
```

**Réponse**

```json
{
  "success": true,
  "data": {
    "id": "event-123",
    "title": "Concert de Jazz",
    "description": "Un super concert de jazz",
    "startDate": "2026-02-15T20:00:00Z",
    "endDate": "2026-02-15T23:00:00Z",
    "venueId": "venue-123",
    "capacity": 100,
    "price": 25.0,
    "organizerId": "organizer-123",
    "categoryId": "category-123",
    "imageUrl": "https://example.com/image.jpg",
    "createdAt": "2026-01-15T10:00:00Z",
    "updatedAt": "2026-01-15T10:00:00Z"
  }
}
```

## 🧪 Tests

### Exécuter les tests

```bash
npm test
```

### Tests unitaires

Les tests unitaires sont situés dans `src/tests/unit/` et utilisent `InMemoryEventRepository` pour tester la logique métier sans dépendre de la base de données.

### Exemples de tests

- Création d'un événement avec des données valides
- Validation du titre (non vide)
- Validation de la date de début (doit être dans le futur)
- Validation de la capacité (positive)
- Validation du prix (positif ou nul)
- Validation des champs obligatoires

## 📚 Documentation Swagger

La documentation Swagger est disponible à :

```
http://localhost:8000/api-docs
```

Pour générer le fichier JSON de la documentation :

```bash
npm run swagger:generate
```

## 📁 Structure du projet

```
eventhub_back/
├── docker-compose.yml          # Configuration Docker pour PostgreSQL
├── .env                        # Variables d'environnement (non versionné)
├── .gitignore
├── package.json
├── tsconfig.json
├── jest.config.ts              # Configuration Jest
├── prisma/
│   ├── schema.prisma           # Schéma de la base de données
│   ├── seed.ts                 # Données de test
│   └── migrations/             # Migrations Prisma (généré)
└── src/
    ├── domain/
    │   ├── entities/
    │   │   └── Event.ts         # Entité Event avec validations
    │   └── interfaces/
    │       └── EventRepositoryInterface.ts
    ├── application/
    │   └── usecases/
    │       ├── CreateEventUseCase.ts
    │       ├── GetAllEventsUseCase.ts
    │       ├── GetEventByIdUseCase.ts
    │       ├── UpdateEventUseCase.ts
    │       └── DeleteEventUseCase.ts
    ├── infrastructure/
    │   ├── prisma/
    │   │   └── client.ts        # Client Prisma
    │   └── repositories/
    │       ├── EventRepositoryDatabase.ts
    │       └── InMemoryEventRepository.ts
    ├── api/
    │   ├── controllers/
    │   │   └── EventController.ts
    │   ├── routes/
    │   │   └── eventRoutes.ts
    │   ├── middlewares/
    │   │   ├── json-api-response.middleware.ts
    │   │   ├── error-handler.middleware.ts
    │   │   └── authentication.middleware.ts
    │   ├── docs/
    │   │   ├── swagger.config.ts
    │   │   ├── generate-swagger.ts
    │   │   └── schemas/
    │   │       └── event.schema.ts
    │   └── server.ts
    ├── utility/
    │   ├── utils.ts
    │   ├── password.utility.ts
    │   └── index.ts
    └── tests/
        └── unit/
            └── CreateEventUseCase.test.ts
```

## 🔒 Règles métier

### Validation des événements

Un événement valide doit respecter les règles suivantes :

- ✅ Le titre est obligatoire et ne peut pas être vide
- ✅ La description est obligatoire et ne peut pas être vide
- ✅ La date de début doit être dans le futur
- ✅ La date de fin (si fournie) doit être postérieure à la date de début
- ✅ Le lieu (venueId) est obligatoire
- ✅ La capacité doit être positive (au moins 1)
- ✅ Le prix (si fourni) doit être positif ou nul
- ✅ L'organisateur (organizerId) est obligatoire
- ✅ La catégorie (categoryId) est obligatoire

## 🗄️ Modèle de données

### Entités principales

- **User** : Utilisateurs (participants, organisateurs, administrateurs)
- **Event** : Événements avec tous les détails
- **Venue** : Lieux des événements
- **Category** : Catégories d'événements

### Relations

- Un `Event` appartient à un `User` (organisateur)
- Un `Event` appartient à une `Category`
- Un `Event` a un `Venue`

## 📝 Notes

- Les migrations Prisma sont générées automatiquement lors de l'exécution de `npx prisma migrate dev`
- Le seed crée des données de test : utilisateurs, catégories, lieux et événements
- La documentation Swagger est générée à partir des annotations JSDoc dans le code

## 🤝 Contribution

Ce projet a été développé dans le cadre d'un projet scolaire suivant l'architecture Onion et les principes de Clean Architecture.

## 📄 Licence

ISC
