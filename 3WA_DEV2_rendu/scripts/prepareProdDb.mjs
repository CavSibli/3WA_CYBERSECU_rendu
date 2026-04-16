import { existsSync, readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";

const migrationsPath = "prisma/migrations";
const hasMigrations =
  existsSync(migrationsPath) && readdirSync(migrationsPath).length > 0;

const command = hasMigrations
  ? ["prisma", "migrate", "deploy"]
  : ["prisma", "db", "push"];

const result = spawnSync("npx", command, {
  stdio: "inherit",
  shell: true,
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}
