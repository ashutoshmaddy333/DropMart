"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useAppSelector } from "@/store/hooks";
import type { Permission } from "@/modules/rbac/permissions";
import type { AuthUser as RbacAuthUser } from "@/modules/rbac/types";
import { Role } from "@/modules/rbac/roles";
import { hasPermission, hasAnyPermission } from "@/lib/auth/roles";

interface SessionContextValue {
  user: RbacAuthUser;
  switchRole: (role: Role) => void;
  hasPermission: (permission: Permission) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
}

const GUEST_USER: RbacAuthUser = {
  id: "",
  name: "Guest",
  email: "",
  role: Role.Customer,
  permissions: [],
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const { user: apiUser } = useAppSelector((s) => s.auth);

  const user: RbacAuthUser = useMemo(() => {
    if (!apiUser) return GUEST_USER;
    return {
      id: apiUser.id,
      name: apiUser.name,
      email: apiUser.email,
      avatar: apiUser.avatar ?? undefined,
      role: apiUser.role as Role,
      permissions: apiUser.permissions as Permission[],
    };
  }, [apiUser]);

  const value = useMemo(
    () => ({
      user,
      switchRole: () => {},
      hasPermission: (p: Permission) => hasPermission(user.permissions, p),
      hasAllPermissions: (perms: Permission[]) => perms.every((p) => hasPermission(user.permissions, p)),
      hasAnyPermission: (perms: Permission[]) => hasAnyPermission(user.permissions, perms),
    }),
    [user],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}

export function usePermission(permission: Permission): boolean {
  return useSession().hasPermission(permission);
}
