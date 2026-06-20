import type { PrismaClient } from "@prisma/client";

export const PERMISSION_GROUPS = [
  { code: "catalog", label: "Catalog", description: "Product catalog management", sortOrder: 1 },
  { code: "orders", label: "Orders", description: "Order processing and tracking", sortOrder: 2 },
  { code: "payments", label: "Payments", description: "Payment and refund operations", sortOrder: 3 },
  { code: "users_access", label: "Users & Access", description: "User management and RBAC", sortOrder: 4 },
  { code: "suppliers", label: "Suppliers", description: "Supplier onboarding and management", sortOrder: 5 },
  { code: "analytics", label: "Analytics", description: "Reports and dashboards", sortOrder: 6 },
  { code: "delivery", label: "Delivery", description: "Live delivery and tracking", sortOrder: 7 },
];

export const ROLES = [
  { code: "superadmin", label: "Super Admin", description: "Full platform access — all rights", sortOrder: 1 },
  { code: "admin", label: "Admin", description: "Platform operations manager", sortOrder: 2 },
  { code: "catalog_manager", label: "Catalog Manager", description: "Manages product catalog", sortOrder: 3 },
  { code: "order_manager", label: "Order Manager", description: "Processes customer orders", sortOrder: 4 },
  { code: "finance", label: "Finance", description: "Handles payments and refunds", sortOrder: 5 },
  { code: "support", label: "Support", description: "Customer support agent", sortOrder: 6 },
  { code: "delivery", label: "Delivery Partner", description: "Delivery boy / rider", sortOrder: 7 },
  { code: "supplier", label: "Supplier", description: "Verified product supplier", sortOrder: 8 },
  { code: "customer", label: "Customer", description: "Storefront buyer", sortOrder: 9 },
];

export const PERMISSIONS: { code: string; label: string; description: string; groupCode: string; sortOrder: number }[] = [
  { code: "product:create", label: "Create Products", description: "Add new products to catalog", groupCode: "catalog", sortOrder: 1 },
  { code: "product:read", label: "View Products", description: "Browse product catalog", groupCode: "catalog", sortOrder: 2 },
  { code: "product:update", label: "Edit Products", description: "Modify existing products", groupCode: "catalog", sortOrder: 3 },
  { code: "product:delete", label: "Delete Products", description: "Remove products from catalog", groupCode: "catalog", sortOrder: 4 },
  { code: "product:approve", label: "Approve Products", description: "Approve supplier-submitted products", groupCode: "catalog", sortOrder: 5 },
  { code: "order:read", label: "View All Orders", description: "See all platform orders", groupCode: "orders", sortOrder: 1 },
  { code: "order:process", label: "Process Orders", description: "Update order status and fulfillment", groupCode: "orders", sortOrder: 2 },
  { code: "order:read:own", label: "View Own Orders", description: "See only own orders", groupCode: "orders", sortOrder: 3 },
  { code: "payment:read", label: "View Payments", description: "View payment records", groupCode: "payments", sortOrder: 1 },
  { code: "payment:refund", label: "Issue Refunds", description: "Process customer refunds", groupCode: "payments", sortOrder: 2 },
  { code: "user:manage", label: "Manage Users", description: "Create and edit user accounts", groupCode: "users_access", sortOrder: 1 },
  { code: "rbac:manage", label: "Manage RBAC", description: "Configure roles and permissions", groupCode: "users_access", sortOrder: 2 },
  { code: "platform:config", label: "Platform Config", description: "Change platform settings", groupCode: "users_access", sortOrder: 3 },
  { code: "supplier:manage", label: "Manage Suppliers", description: "View all suppliers", groupCode: "suppliers", sortOrder: 1 },
  { code: "supplier:read:own", label: "View Own Supplier Data", description: "Access own supplier profile", groupCode: "suppliers", sortOrder: 2 },
  { code: "supplier:verify", label: "Verify Suppliers", description: "Approve or reject suppliers", groupCode: "suppliers", sortOrder: 3 },
  { code: "analytics:read", label: "View Analytics", description: "Access dashboards and reports", groupCode: "analytics", sortOrder: 1 },
  { code: "delivery:track", label: "Live Delivery Tracking", description: "View live delivery map", groupCode: "delivery", sortOrder: 1 },
  { code: "delivery:update", label: "Update Delivery Location", description: "Update rider GPS location", groupCode: "delivery", sortOrder: 2 },
];

export const ROLE_PERMISSION_MAP: Record<string, string[]> = {
  superadmin: PERMISSIONS.map((p) => p.code),
  admin: [
    "product:create", "product:read", "product:update", "product:delete", "product:approve",
    "order:read", "order:process", "payment:read", "payment:refund",
    "user:manage", "analytics:read", "supplier:manage", "supplier:verify",
  ],
  catalog_manager: ["product:create", "product:read", "product:update", "product:delete", "product:approve"],
  order_manager: ["order:read", "order:process", "payment:read", "supplier:read:own", "product:read"],
  finance: ["payment:read", "payment:refund", "analytics:read", "order:read"],
  support: ["order:read", "product:read"],
  delivery: ["delivery:track", "delivery:update", "order:read:own"],
  supplier: ["product:create", "product:read", "product:update", "supplier:read:own", "order:read:own"],
  customer: ["product:read", "order:read:own"],
};

export async function seedRbac(prisma: PrismaClient) {
  console.log("  → master_permission_groups");
  for (const g of PERMISSION_GROUPS) {
    await prisma.masterPermissionGroup.upsert({
      where: { code: g.code },
      update: g,
      create: g,
    });
  }

  console.log("  → master_roles");
  for (const role of ROLES) {
    await prisma.masterRole.upsert({ where: { code: role.code }, update: role, create: role });
  }

  console.log("  → master_permissions");
  for (const perm of PERMISSIONS) {
    const group = await prisma.masterPermissionGroup.findUnique({ where: { code: perm.groupCode } });
    if (!group) continue;
    const { groupCode, ...data } = perm;
    await prisma.masterPermission.upsert({
      where: { code: perm.code },
      update: { ...data, groupId: group.id },
      create: { ...data, groupId: group.id },
    });
  }

  console.log("  → role_permissions");
  for (const [roleCode, permCodes] of Object.entries(ROLE_PERMISSION_MAP)) {
    const role = await prisma.masterRole.findUnique({ where: { code: roleCode } });
    if (!role) continue;
    for (const permCode of permCodes) {
      const perm = await prisma.masterPermission.findUnique({ where: { code: permCode } });
      if (!perm) continue;
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: perm.id } },
        update: {},
        create: { roleId: role.id, permissionId: perm.id },
      });
    }
  }
}
