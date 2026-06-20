"use client";

import { AdminShell } from "@/modules/admin-ui/layout/admin-shell";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminShell>{children}</AdminShell>;
}
