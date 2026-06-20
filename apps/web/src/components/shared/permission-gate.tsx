"use client";

import type { ReactNode } from "react";
import type { Permission } from "@/modules/rbac/permissions";
import { useSession } from "@/modules/auth/session-context";

interface PermissionGateProps {
  require: Permission | Permission[];
  mode?: "all" | "any";
  fallback?: ReactNode;
  children: ReactNode;
}

export function PermissionGate({
  require,
  mode = "all",
  fallback = null,
  children,
}: PermissionGateProps) {
  const { hasAllPermissions, hasAnyPermission } = useSession();
  const permissions = Array.isArray(require) ? require : [require];

  const allowed =
    mode === "all"
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);

  if (!allowed) return <>{fallback}</>;
  return <>{children}</>;
}
