import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import { jsonApiResponseMiddleware, errorHandlerMiddleware } from "./middlewares/index";
import { csrfMiddleware, getCsrfToken } from "./middlewares/csrf.middleware";
import { eventRoutes } from "./routes/eventRoutes";
import { authRoutes } from "./routes/authRoutes";
import { a2fRoutes } from "./routes/a2fRoutes";
import swaggerOptions from "./docs/swagger.config";

const app = express();
const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Configuration Helmet avec CSP
const isProduction = process.env.NODE_ENV === "production";
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(
  helmet({
    contentSecurityPolicy: isProduction
      ? {
          directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"], // Swagger UI nécessite unsafe-inline
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"], // Pour les QR codes et images
            connectSrc: ["'self'", frontendUrl],
          },
        }
      : false, // Désactiver CSP en développement pour faciliter le debug
    crossOriginEmbedderPolicy: false, // Nécessaire pour Swagger UI
  })
);

// Configuration CORS restrictive
app.use(
  cors({
    origin: frontendUrl,
    credentials: true, // Permet l'envoi de cookies
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(jsonApiResponseMiddleware);

// Middleware CSRF (doit être après cookieParser)
app.use(csrfMiddleware);

// Endpoint pour récupérer le token CSRF
app.get("/api/csrf-token", getCsrfToken);

// Routes
app.use("/api/events", eventRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/a2f", a2fRoutes);

// Swagger documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Error handler (doit être le dernier middleware)
app.use(errorHandlerMiddleware);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api/events`);
  console.log(`Auth endpoints available at http://localhost:${PORT}/api/auth`);
  console.log(`A2F endpoints available at http://localhost:${PORT}/api/a2f`);
  console.log(`Swagger documentation available at http://localhost:${PORT}/api-docs`);
});
