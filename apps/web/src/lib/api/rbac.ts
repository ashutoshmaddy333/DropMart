import { apiFetch } from "./client";

export interface RbacRole {
  id: string;
  code: string;
  label: string;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
  userCount: number;
  permissionIds: string[];
  permissions: { id: string; code: string; label: string }[];
}

export interface RbacPermission {
  id: string;
  code: string;
  label: string;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
  groupId: string;
  groupCode: string;
  groupLabel: string;
  roleCount: number;
}

export interface RbacPermissionGroup {
  id: string;
  code: string;
  label: string;
  description: string | null;
}

export function fetchRoles(token?: string | null) {
  return apiFetch<RbacRole[]>("/rbac/roles", { token });
}

export function createRole(
  data: {
    code: string;
    label: string;
    description?: string;
    sortOrder?: number;
    permissionIds?: string[];
  },
  token?: string | null,
) {
  return apiFetch<RbacRole>("/rbac/roles", {
    method: "POST",
    token,
    body: JSON.stringify(data),
  });
}

export function updateRole(
  id: string,
  data: {
    label?: string;
    description?: string;
    sortOrder?: number;
    isActive?: boolean;
    permissionIds?: string[];
  },
  token?: string | null,
) {
  return apiFetch<RbacRole>(`/rbac/roles/${id}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(data),
  });
}

export function deleteRole(id: string, token?: string | null) {
  return apiFetch<{ success: boolean }>(`/rbac/roles/${id}`, {
    method: "DELETE",
    token,
  });
}

export function fetchPermissions(token?: string | null) {
  return apiFetch<{ groups: RbacPermissionGroup[]; permissions: RbacPermission[] }>(
    "/rbac/permissions",
    { token },
  );
}

export function createPermission(
  data: {
    code: string;
    label: string;
    description?: string;
    groupId: string;
    sortOrder?: number;
  },
  token?: string | null,
) {
  return apiFetch<RbacPermission>("/rbac/permissions", {
    method: "POST",
    token,
    body: JSON.stringify(data),
  });
}

export function updatePermission(
  id: string,
  data: {
    label?: string;
    description?: string;
    groupId?: string;
    sortOrder?: number;
    isActive?: boolean;
  },
  token?: string | null,
) {
  return apiFetch<RbacPermission>(`/rbac/permissions/${id}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(data),
  });
}

export function deletePermission(id: string, token?: string | null) {
  return apiFetch<{ success: boolean }>(`/rbac/permissions/${id}`, {
    method: "DELETE",
    token,
  });
}
