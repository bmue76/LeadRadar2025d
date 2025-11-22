import { PrismaClient } from "@prisma/client";

// Wir nutzen ein globales Objekt, damit in der Dev-Umgebung
// nicht bei jedem Hot-Reload ein neuer PrismaClient erstellt wird.
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Wenn dir das zu viel Log ist, kannst du das später anpassen:
    log: ["warn", "error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
