import type { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const USERS = [
  { email: "ashutoshkumarm416@gmail.com", name: "Ashutosh Kumar", role: "superadmin", phone: "+91 7355552418", password: "Maddy8787" },
  { email: "rahul@dropmart.in", name: "Rahul Mehta", role: "admin", phone: null, password: "password123" },
  { email: "ananya@dropmart.in", name: "Ananya Patel", role: "catalog_manager", phone: null, password: "password123" },
  { email: "vikram@dropmart.in", name: "Vikram Singh", role: "order_manager", phone: null, password: "password123" },
  { email: "deepa@dropmart.in", name: "Deepa Nair", role: "finance", phone: null, password: "password123" },
  { email: "karan@dropmart.in", name: "Karan Joshi", role: "support", phone: null, password: "password123" },
  { email: "arjun@gmail.com", name: "Arjun Kumar", role: "customer", phone: "+91 7355552418", password: "password123" },
  { email: "meera@supplier.in", name: "Meera Traders", role: "supplier", phone: "+91 9123456789", password: "password123" },
  { email: "new@supplier.in", name: "New Supplier Co", role: "supplier", phone: null, password: "password123" },
  { email: "ravi@delivery.in", name: "Ravi Delivery", role: "delivery", phone: "+91 9988776655", password: "password123" },
];

export async function seedUsers(prisma: PrismaClient) {
  console.log("  → users");
  const activeStatus = await prisma.masterUserStatus.findUnique({ where: { code: "active" } });
  if (!activeStatus) throw new Error("master_user_statuses not seeded");

  const created: Record<string, { id: string }> = {};

  for (const u of USERS) {
    const role = await prisma.masterRole.findUnique({ where: { code: u.role } });
    if (!role) throw new Error(`Role ${u.role} not found`);
    const hash = await bcrypt.hash(u.password, 10);
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, phone: u.phone, passwordHash: hash, roleId: role.id, statusId: activeStatus.id },
      create: {
        email: u.email,
        name: u.name,
        phone: u.phone,
        passwordHash: hash,
        roleId: role.id,
        statusId: activeStatus.id,
      },
    });
    created[u.email] = user;
  }

  return created;
}
