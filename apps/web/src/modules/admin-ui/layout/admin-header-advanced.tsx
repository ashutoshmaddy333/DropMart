"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/shared/icon";
import { RoleBadge } from "@/components/shared/role-badge";
import { CommandPalette } from "../components/command-palette";
import { AdminNotificationsBell } from "@/components/admin/notifications/admin-notifications-bell";
import { useSession } from "@/modules/auth/session-context";
import { useLogout } from "@/hooks/use-logout";

interface AdminHeaderAdvancedProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function AdminHeaderAdvanced({ title, subtitle, actions }: AdminHeaderAdvancedProps) {
  const { user } = useSession();
  const handleLogout = useLogout();

  return (
    <>
      <CommandPalette />
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-[var(--admin-border)] bg-[rgba(10,10,15,0.8)] px-6 backdrop-blur-xl"
      >
        <div>
          <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
          {subtitle && (
            <p className="text-xs text-[var(--admin-text-muted)]">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              document.dispatchEvent(
                new KeyboardEvent("keydown", { key: "k", metaKey: true })
              );
            }}
            className="flex items-center gap-2 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 py-1.5 text-xs text-[var(--admin-text-muted)] transition-colors hover:border-[var(--admin-border-active)] hover:text-[var(--admin-text)]"
          >
            <Icon name="search" size={14} />
            <span className="hidden sm:inline">Search...</span>
            <kbd className="hidden rounded border border-[var(--admin-border)] px-1.5 py-0.5 text-[10px] sm:inline">
              ⌘K
            </kbd>
          </button>

          <AdminNotificationsBell />

          {actions}

          <Link
            href="/admin/rbac"
            className="hidden rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-medium text-indigo-400 transition-colors hover:bg-indigo-500/20 sm:inline-flex"
          >
            RBAC
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-text)] hover:bg-[var(--admin-surface-hover)]"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600/50 text-xs font-bold text-white">
                  {user.name.charAt(0) || "A"}
                </div>
                <span className="max-w-[140px] truncate">{user.name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col gap-1">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  <RoleBadge role={user.role} className="mt-1 w-fit" />
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/">Back to Store</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={handleLogout}>
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.header>
    </>
  );
}
