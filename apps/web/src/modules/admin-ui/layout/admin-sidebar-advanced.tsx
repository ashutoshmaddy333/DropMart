"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Icon, type IconName } from "@/components/shared/icon";
import { RoleBadge } from "@/components/shared/role-badge";
import { PermissionGate } from "@/components/shared/permission-gate";
import { useSession } from "@/modules/auth/session-context";
import { useLogout } from "@/hooks/use-logout";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { ADMIN_NAV, SITE_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useAdminMobileNav } from "./admin-mobile-nav-context";

interface AdminSidebarNavProps {
  collapsed?: boolean;
  onNavigate?: () => void;
  showCollapseToggle?: boolean;
  onToggleCollapse?: () => void;
}

export function AdminSidebarNav({
  collapsed = false,
  onNavigate,
  showCollapseToggle = false,
  onToggleCollapse,
}: AdminSidebarNavProps) {
  const pathname = usePathname();
  const handleLogout = useLogout();
  const { user } = useSession();

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-3 border-b border-[var(--admin-border)] px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-600/30">
          <Icon name="shopping-bag-solid" size={18} className="invert" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden"
            >
              <p className="text-sm font-bold">{SITE_NAME}</p>
              <p className="text-[10px] text-[var(--admin-text-muted)]">Admin Console</p>
            </motion.div>
          )}
        </AnimatePresence>
        {showCollapseToggle && onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="ml-auto flex h-7 w-7 items-center justify-center rounded-lg text-[var(--admin-text-muted)] transition-colors hover:bg-[var(--admin-surface-hover)] hover:text-[var(--admin-text)]"
          >
            {collapsed ? "→" : "←"}
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {ADMIN_NAV.map((item, i) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          const link = (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                href={item.href}
                onClick={onNavigate}
                className={cn("admin-nav-item", isActive && "active")}
                title={collapsed ? item.label : undefined}
              >
                <Icon name={item.icon as IconName} size={18} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            </motion.div>
          );

          if (!item.permission) return link;
          return (
            <PermissionGate key={item.href} require={item.permission}>
              {link}
            </PermissionGate>
          );
        })}
        <button
          type="button"
          onClick={() => {
            onNavigate?.();
            void handleLogout();
          }}
          className={cn(
            "admin-nav-item mt-2 w-full border border-red-500/40 bg-red-500/15 text-red-400 hover:bg-red-500/25 hover:text-red-300",
          )}
          title="Sign Out"
        >
          <Icon name="lock" size={18} />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </nav>

      <div className="shrink-0 border-t border-[var(--admin-border)] p-3">
        {!collapsed ? (
          <div className="admin-glass rounded-xl p-3">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-[11px] text-[var(--admin-text-muted)]">{user.email}</p>
            <RoleBadge role={user.role} className="mt-2" />
            <Button
              size="sm"
              className="mt-3 w-full bg-red-600 text-white hover:bg-red-700"
              onClick={() => {
                onNavigate?.();
                void handleLogout();
              }}
            >
              Sign Out
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600/30 text-xs font-bold">
              {user.name.charAt(0)}
            </div>
            <Button
              size="icon"
              className="h-9 w-9 bg-red-600 text-white hover:bg-red-700"
              onClick={() => {
                onNavigate?.();
                void handleLogout();
              }}
              title="Sign Out"
            >
              <Icon name="lock" size={16} />
            </Button>
          </div>
        )}
        <Link
          href="/"
          onClick={onNavigate}
          className="mt-2 flex items-center justify-center gap-2 rounded-lg py-2 text-xs text-[var(--admin-text-muted)] transition-colors hover:text-[var(--admin-text)]"
        >
          {!collapsed && "← Back to Store"}
        </Link>
      </div>
    </div>
  );
}

export function AdminMobileSidebar() {
  const { open, setOpen } = useAdminMobileNav();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side="left"
        className="admin-ui flex h-full w-[min(100vw,300px)] flex-col border-[var(--admin-border)] bg-[#0a0a0f] p-0 text-[var(--admin-text)] sm:max-w-[300px]"
      >
        <SheetTitle className="sr-only">Admin navigation</SheetTitle>
        <AdminSidebarNav onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}

export function AdminSidebarAdvanced() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-20 hidden h-screen shrink-0 flex-col border-r border-[var(--admin-border)] bg-[rgba(255,255,255,0.02)] backdrop-blur-xl lg:flex"
    >
      <AdminSidebarNav
        collapsed={collapsed}
        showCollapseToggle
        onToggleCollapse={() => setCollapsed(!collapsed)}
      />
    </motion.aside>
  );
}
