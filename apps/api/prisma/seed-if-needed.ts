import { PrismaClient } from "@prisma/client";
import { isDatabaseSeeded, seedDatabase } from "./seed";

const prisma = new PrismaClient();

async function main() {
  try {
    if (await isDatabaseSeeded(prisma)) {
      console.log("✅ Database already seeded — skipping");
      return;
    }

    await seedDatabase(prisma);
  } catch (error) {
    console.error("❌ Seed check failed:", error);
    process.exit(1);
  }
}

main().finally(() => prisma.$disconnect());
