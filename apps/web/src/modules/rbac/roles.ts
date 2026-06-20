export enum Role {
  SuperAdmin = "superadmin",
  Admin = "admin",
  CatalogManager = "catalog_manager",
  OrderManager = "order_manager",
  Finance = "finance",
  Support = "support",
  Supplier = "supplier",
  Customer = "customer",
}

export const ROLE_LABELS: Record<Role, string> = {
  [Role.SuperAdmin]: "Super Admin",
  [Role.Admin]: "Admin",
  [Role.CatalogManager]: "Catalog Manager",
  [Role.OrderManager]: "Order Manager",
  [Role.Finance]: "Finance",
  [Role.Support]: "Support",
  [Role.Supplier]: "Supplier",
  [Role.Customer]: "Customer",
};

export const ADMIN_ROLES: Role[] = [
  Role.SuperAdmin,
  Role.Admin,
  Role.CatalogManager,
  Role.OrderManager,
  Role.Finance,
  Role.Support,
];

export function isAdminRole(role: Role): boolean {
  return ADMIN_ROLES.includes(role);
}
