export const ADMIN_ROLES = ["superadmin", "admin", "catalog_manager", "order_manager", "finance", "support"];

export function isAdminRole(role: string): boolean {
  return ADMIN_ROLES.includes(role);
}

export function getRoleHomePath(role: string, supplierStatus?: string | null): string {
  if (isAdminRole(role)) return "/admin";
  if (role === "supplier") {
    if (supplierStatus === "verified") return "/supplier";
    return "/supplier/pending";
  }
  if (role === "delivery") return "/delivery";
  return "/";
}

export function hasPermission(permissions: string[], permission: string): boolean {
  return permissions.includes(permission);
}

export function hasAnyPermission(permissions: string[], required: string[]): boolean {
  return required.some((p) => permissions.includes(p));
}
