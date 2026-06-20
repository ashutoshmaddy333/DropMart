import { Permission } from "./permissions";
import { Role } from "./roles";

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.SuperAdmin]: Object.values(Permission),
  [Role.Admin]: [
    Permission.ProductCreate,
    Permission.ProductRead,
    Permission.ProductUpdate,
    Permission.ProductDelete,
    Permission.OrderRead,
    Permission.OrderProcess,
    Permission.PaymentRead,
    Permission.PaymentRefund,
    Permission.UserManage,
    Permission.AnalyticsRead,
    Permission.SupplierManage,
  ],
  [Role.CatalogManager]: [
    Permission.ProductCreate,
    Permission.ProductRead,
    Permission.ProductUpdate,
    Permission.ProductDelete,
  ],
  [Role.OrderManager]: [
    Permission.OrderRead,
    Permission.OrderProcess,
    Permission.PaymentRead,
    Permission.SupplierReadOwn,
    Permission.ProductRead,
  ],
  [Role.Finance]: [
    Permission.PaymentRead,
    Permission.PaymentRefund,
    Permission.AnalyticsRead,
    Permission.OrderRead,
  ],
  [Role.Support]: [Permission.OrderRead, Permission.ProductRead],
  [Role.Supplier]: [Permission.ProductRead, Permission.SupplierReadOwn],
  [Role.Customer]: [Permission.ProductRead, Permission.OrderReadOwn],
};

export function getPermissionsForRole(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

export function roleHasPermission(role: Role, permission: Permission): boolean {
  return getPermissionsForRole(role).includes(permission);
}

export function roleHasAllPermissions(
  role: Role,
  permissions: Permission[]
): boolean {
  const userPerms = getPermissionsForRole(role);
  return permissions.every((p) => userPerms.includes(p));
}

export function roleHasAnyPermission(
  role: Role,
  permissions: Permission[]
): boolean {
  const userPerms = getPermissionsForRole(role);
  return permissions.some((p) => userPerms.includes(p));
}
