"use client";

import { useAppSelector } from "@/store/hooks";
import { hasPermission, hasAnyPermission, isAdminRole } from "@/lib/auth/roles";

export function useAuth() {
  const { user, token, loading, error, initialized } = useAppSelector((s) => s.auth);

  return {
    user,
    token,
    loading,
    error,
    initialized,
    isAuthenticated: !!user,
    isAdmin: user ? isAdminRole(user.role) : false,
    isSupplier: user?.role === "supplier",
    isCustomer: user?.role === "customer",
    isDelivery: user?.role === "delivery",
    isSupplierVerified: user?.supplier?.status === "verified",
    hasPermission: (perm: string) => (user ? hasPermission(user.permissions, perm) : false),
    hasAnyPermission: (perms: string[]) => (user ? hasAnyPermission(user.permissions, perms) : false),
  };
}
