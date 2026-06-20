import { PrismaClient } from "@prisma/client";
import { seedRbac } from "./seeds/master-rbac";
import { seedStatuses } from "./seeds/master-statuses";
import { seedCatalog } from "./seeds/master-catalog";
import { seedUsers } from "./seeds/users";
import { seedBusinessData } from "./seeds/business-data";

export const SEED_MARKER_EMAIL = "ashutoshkumarm416@gmail.com";

export async function isDatabaseSeeded(prisma: PrismaClient): Promise<boolean> {
  const [roleCount, superAdmin] = await Promise.all([
    prisma.masterRole.count(),
    prisma.user.findUnique({ where: { email: SEED_MARKER_EMAIL }, select: { id: true } }),
  ]);
  return roleCount > 0 && superAdmin !== null;
}

export async function seedDatabase(prisma: PrismaClient) {
  console.log("🌱 Seeding DropMart database...\n");

  console.log("📁 RBAC master tables (roles, rights, mapping)");
  await seedRbac(prisma);

  console.log("\n📁 Status master tables");
  await seedStatuses(prisma);

  console.log("\n📁 Catalog & platform settings");
  await seedCatalog(prisma);

  console.log("\n📁 Users");
  const users = await seedUsers(prisma);

  console.log("\n📁 Business data (suppliers, products, orders)");
  await seedBusinessData(prisma, users);

  console.log("\n✅ Seed complete!");
  console.log("\n📋 Demo accounts:");
  console.log("  Super Admin     : ashutoshkumarm416@gmail.com (password: Maddy8787)");
  console.log("  Admin           : rahul@dropmart.in (password: password123)");
  console.log("  Catalog Manager : ananya@dropmart.in (password: password123)");
  console.log("  Order Manager   : vikram@dropmart.in (password: password123)");
  console.log("  Finance         : deepa@dropmart.in (password: password123)");
  console.log("  Support         : karan@dropmart.in (password: password123)");
  console.log("  Customer        : arjun@gmail.com (password: password123)");
  console.log("  Supplier        : meera@supplier.in (verified, password: password123)");
  console.log("  Supplier        : new@supplier.in (pending verification, password: password123)");
  console.log("  Delivery        : ravi@delivery.in (password: password123)");
}

const prisma = new PrismaClient();

async function main() {
  await seedDatabase(prisma);
}

if (require.main === module) {
  main()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}
