import type { Permission } from "./permissions";
import type { Role } from "./roles";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: Role;
  permissions: Permission[];
}

export interface RbacMatrixCell {
  role: Role;
  permission: Permission;
  granted: boolean;
}
