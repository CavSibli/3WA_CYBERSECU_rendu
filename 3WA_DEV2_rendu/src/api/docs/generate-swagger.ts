import swaggerJSDoc from "swagger-jsdoc";
import fs from "fs";
import swaggerOptions from "./swagger.config";

const swaggerSpec = swaggerJSDoc(swaggerOptions);

fs.writeFileSync("./src/api/docs/swagger-output.json", JSON.stringify(swaggerSpec, null, 2));

console.log("Fichier Swagger généré: src/api/docs/swagger-output.json");
