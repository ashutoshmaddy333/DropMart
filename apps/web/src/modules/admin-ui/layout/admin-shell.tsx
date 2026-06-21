"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useSession } from "@/modules/auth/session-context";
import { isAdminRole } from "@/lib/auth/roles";
import { AdminSidebarAdvanced, AdminMobileSidebar } from "./admin-sidebar-advanced";
import { AdminMobileNavProvider } from "./admin-mobile-nav-context";
import "../theme/admin-theme.css";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { user } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (user.id && !isAdminRole(user.role)) {
      router.replace("/login?redirect=/admin");
    }
  }, [user.id, user.role, router]);

  if (!isAdminRole(user.role)) {
    return (
      <div className="admin-ui flex min-h-screen items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="h-8 w-8 rounded-full border-2 border-indigo-500 border-t-transparent"
        />
      </div>
    );
  }

  return (
    <AdminMobileNavProvider>
      <div className="admin-ui flex min-h-screen">
        <div className="admin-bg-mesh" />
        <AdminMobileSidebar />
        <AdminSidebarAdvanced />
        <div className="relative z-10 flex min-w-0 flex-1 flex-col overflow-hidden">
          {children}
        </div>
      </div>
    </AdminMobileNavProvider>
  );
}
