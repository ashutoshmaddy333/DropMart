"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Icon, type IconName } from "@/components/shared/icon";
import { RoleBadge } from "@/components/shared/role-badge";
import { PermissionGate } from "@/components/shared/permission-gate";
import { useSession } from "@/modules/auth/session-context";
import { ADMIN_NAV, SITE_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useSession();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r bg-slate-50 dark:bg-slate-950 lg:flex">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Icon name="shopping-bag-solid" size={16} className="invert" />
        </div>
        <div>
          <p className="text-sm font-bold">{SITE_NAME}</p>
          <p className="text-[10px] text-muted-foreground">Admin Panel</p>
        </div>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {ADMIN_NAV.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            const link = (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <Icon name={item.icon as IconName} size={18} className={isActive ? "invert dark:invert" : ""} />
                {item.label}
              </Link>
            );

            if (!item.permission) return link;

            return (
              <PermissionGate
                key={item.href}
                require={item.permission}
              >
                {link}
              </PermissionGate>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="border-t p-4">
        <div className="rounded-lg bg-card p-3">
          <p className="truncate text-sm font-medium">{user.name}</p>
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          <RoleBadge role={user.role} className="mt-2" />
        </div>
        <Button variant="ghost" size="sm" className="mt-2 w-full" asChild>
          <Link href="/">← Back to Store</Link>
        </Button>
      </div>
    </aside>
  );
}

export function AdminTopBar({ title }: { title: string }) {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      <h1 className="text-lg font-semibold">{title}</h1>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon">
          <Icon name="bell" size={18} />
        </Button>
        <Separator orientation="vertical" className="h-6" />
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/rbac">RBAC Matrix</Link>
        </Button>
      </div>
    </header>
  );
}
