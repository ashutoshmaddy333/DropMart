import { PrismaClient } from "@prisma/client";
import { runSeed } from "./seed";

const prisma = new PrismaClient();

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

async function main() {
  await runSeed(prisma);
}
