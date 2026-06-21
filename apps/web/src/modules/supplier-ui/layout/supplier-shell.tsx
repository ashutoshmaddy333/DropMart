"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Icon } from "@/components/shared/icon";
import { NotificationsBell } from "@/components/shared/notifications-bell";
import { useAuth } from "@/hooks/use-auth";
import { useAppDispatch } from "@/store/hooks";
import { logout, logoutUser } from "@/store/slices/authSlice";
import { SITE_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/supplier", label: "Dashboard", icon: "chart-bar" as const, match: (p: string) => p === "/supplier" },
  { href: "/supplier/products", label: "Products", icon: "cube" as const, match: (p: string) => p.startsWith("/supplier/products") && !p.endsWith("/new") },
  { href: "/supplier/orders", label: "Orders", icon: "shopping-cart" as const, match: (p: string) => p.startsWith("/supplier/orders") },
  { href: "/supplier/products/new", label: "Add", icon: "bolt" as const, match: (p: string) => p.endsWith("/new") },
];

function SupplierNavLinks({
  pathname,
  onNavigate,
  className,
}: {
  pathname: string;
  onNavigate?: () => void;
  className?: string;
}) {
  return (
    <nav className={cn("space-y-1", className)}>
      {NAV.map((item) => {
        const isActive = item.match(pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive ? "bg-brand/10 text-brand" : "text-muted-foreground hover:bg-muted",
            )}
          >
            <Icon name={item.icon} size={16} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function SupplierShell({ children }: { children: React.ReactNode }) {
  const { user, isSupplier, isSupplierVerified, isAdmin } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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
      <aside className="relative hidden w-64 shrink-0 border-r bg-card md:block">
        <div className="flex h-16 items-center gap-2 border-b px-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand">
            <Icon name="shopping-bag-solid" size={16} className="invert" />
          </div>
          <div>
            <p className="text-sm font-bold">{SITE_NAME}</p>
            <p className="text-xs text-muted-foreground">Supplier Portal</p>
          </div>
        </div>
        <SupplierNavLinks pathname={pathname} className="p-3" />
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

      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="flex w-[min(100vw,300px)] flex-col p-0 sm:max-w-[300px]">
          <SheetTitle className="sr-only">Supplier navigation</SheetTitle>
          <div className="flex h-16 items-center gap-2 border-b px-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand">
              <Icon name="shopping-bag-solid" size={16} className="invert" />
            </div>
            <div>
              <p className="text-sm font-bold">{SITE_NAME}</p>
              <p className="text-xs text-muted-foreground">Supplier Portal</p>
            </div>
          </div>
          <SupplierNavLinks
            pathname={pathname}
            onNavigate={() => setMobileNavOpen(false)}
            className="flex-1 p-3"
          />
          <div className="border-t p-4">
            <div className="rounded-lg border bg-muted/30 p-3 text-xs">
              <p className="font-medium">{user?.supplier?.businessName ?? user?.name}</p>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
            <Button variant="ghost" size="sm" className="mt-2 w-full" onClick={handleLogout}>
              Sign Out
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <main className="flex min-w-0 flex-1 flex-col overflow-auto pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-2 border-b bg-background/95 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:px-4 md:h-16 md:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-card md:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h2 className="truncate text-sm font-semibold sm:text-base">
              {user?.supplier?.businessName ?? "Supplier Portal"}
            </h2>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <NotificationsBell />
            <Button variant="outline" size="sm" asChild>
              <Link href="/">Store</Link>
            </Button>
          </div>
        </header>
        <div className="p-3 sm:p-4 md:p-6">{children}</div>
      </main>

      <nav
        className="fixed bottom-0 left-0 right-0 z-40 border-t bg-card/95 backdrop-blur md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="grid grid-cols-4">
          {NAV.map((item) => {
            const isActive = item.match(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-1 py-2.5 text-[10px] font-medium transition-colors",
                  isActive ? "text-brand" : "text-muted-foreground",
                )}
              >
                <Icon name={item.icon} size={18} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
