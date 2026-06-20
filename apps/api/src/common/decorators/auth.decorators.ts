import { SetMetadata } from "@nestjs/common";

export const PERMISSIONS_KEY = "permissions";
export const ROLES_KEY = "roles";
export const IS_PUBLIC_KEY = "isPublic";
export const SKIP_CSRF_KEY = "skipCsrf";

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
export const SkipCsrf = () => SetMetadata(SKIP_CSRF_KEY, true);
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
export const RequireRoles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  permissions: string[];
}

export interface RequestUser {
  id: string;
  email: string;
  role: string;
  permissions: string[];
  name?: string;
  supplierId?: string;
  deliveryBoyId?: string;
}
