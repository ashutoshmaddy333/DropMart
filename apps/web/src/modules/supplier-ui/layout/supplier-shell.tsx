"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/shared/icon";
import { NotificationsBell } from "@/components/shared/notifications-bell";
import { useAuth } from "@/hooks/use-auth";
import { useAppDispatch } from "@/store/hooks";
import { logout, logoutUser } from "@/store/slices/authSlice";
import { SITE_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/supplier", label: "Dashboard", icon: "chart-bar" as const },
  { href: "/supplier/products", label: "My Products", icon: "cube" as const },
  { href: "/supplier/orders", label: "Orders", icon: "shopping-cart" as const },
  { href: "/supplier/products/new", label: "Add Product", icon: "bolt" as const },
];

export function SupplierShell({ children }: { children: React.ReactNode }) {
  const { user, isSupplier, isSupplierVerified, isAdmin } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!user) return;
    if (!isSupplier && !isAdmin) router.replace("/");
    const allowedWhilePending = pathname.includes("/pending");
    if (isSupplier && !isSupplierVerified && !allowedWhilePending) {
      router.replace("/supplier/pending");
    }
  }, [user, isSupplier, isSupplierVerified, isAdmin, pathname, router]);

  async function handleLogout() {
    await dispatch(logoutUser());
    dispatch(logout());
    router.push("/login");
  }

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 border-r bg-card md:block">
        <div className="flex h-16 items-center gap-2 border-b px-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand">
            <Icon name="shopping-bag-solid" size={16} className="invert" />
          </div>
          <div>
            <p className="text-sm font-bold">{SITE_NAME}</p>
            <p className="text-xs text-muted-foreground">Supplier Portal</p>
          </div>
        </div>
        <nav className="space-y-1 p-3">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                pathname === item.href || (item.href !== "/supplier" && pathname.startsWith(item.href + "/")) ? "bg-brand/10 text-brand" : "text-muted-foreground hover:bg-muted",
              )}
            >
              <Icon name={item.icon} size={16} />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-4 left-4 right-4 md:w-56">
          <div className="rounded-lg border bg-muted/30 p-3 text-xs">
            <p className="font-medium">{user?.supplier?.businessName ?? user?.name}</p>
            <p className="text-muted-foreground">{user?.email}</p>
          </div>
          <Button variant="ghost" size="sm" className="mt-2 w-full" onClick={handleLogout}>
            Sign Out
          </Button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <header className="flex h-14 items-center justify-between border-b px-4 md:px-6">
          <h2 className="font-semibold">{user?.supplier?.businessName ?? "Supplier Portal"}</h2>
          <div className="flex items-center gap-2">
            <NotificationsBell />
            <Button variant="outline" size="sm" asChild>
              <Link href="/">View Storefront</Link>
            </Button>
          </div>
        </header>
        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}
