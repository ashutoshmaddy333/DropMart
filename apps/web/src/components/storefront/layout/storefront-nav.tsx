"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Icon } from "@/components/shared/icon";
import { RoleBadge } from "@/components/shared/role-badge";
import { SocialLinks } from "@/components/shared/social-links";
import { useSession } from "@/modules/auth/session-context";
import { useAuth } from "@/hooks/use-auth";
import { useLogout } from "@/hooks/use-logout";
import { isAdminRole, getRoleHomePath } from "@/lib/auth/roles";
import { NAV_CATEGORIES, NAV_LINKS, CONTACT, SITE_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

const SUPPORT_LINKS = [
  { name: "Contact Us", href: "/contact", icon: "mail" as const },
  { name: "Help Center", href: "/help", icon: "bell" as const },
  { name: "Returns", href: "/returns", icon: "returns" as const },
  { name: "Shipping", href: "/shipping", icon: "truck" as const },
];

function NavLink({
  href,
  children,
  className,
  active,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "relative rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-brand/10 text-brand"
          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function DesktopNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <nav className="hidden items-center gap-1 lg:flex">
      <NavLink href="/products" active={isActive("/products")}>
        All Products
      </NavLink>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              "inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              pathname.startsWith("/categories")
                ? "bg-brand/10 text-brand"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
            )}
          >
            Categories
            <ChevronDown size={14} className="opacity-60" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[420px] p-3">
          <div className="mb-2 flex items-center justify-between px-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Shop by Category
            </p>
            <Link href="/categories" className="text-xs font-medium text-brand hover:underline">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {NAV_CATEGORIES.map((cat) => (
              <DropdownMenuItem key={cat.slug} asChild className="p-0 focus:bg-transparent">
                <Link
                  href={`/categories/${cat.slug}`}
                  className="group flex items-center gap-3 rounded-xl border border-transparent p-2 transition-all hover:border-border hover:bg-muted/50"
                >
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      sizes="48px"
                    />
                  </div>
                  <span className="text-sm font-medium">{cat.name}</span>
                </Link>
              </DropdownMenuItem>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <Link
        href="/products?deals=flash"
        className="ml-1 inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-3 py-1.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-500/15"
      >
        <Icon name="bolt" size={14} />
        Flash Deals
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              "inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              SUPPORT_LINKS.some((l) => isActive(l.href))
                ? "bg-brand/10 text-brand"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
            )}
          >
            Support
            <ChevronDown size={14} className="opacity-60" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-52">
          {SUPPORT_LINKS.map((link) => (
            <DropdownMenuItem key={link.href} asChild>
              <Link href={link.href} className="flex items-center gap-2">
                <Icon name={link.icon} size={16} />
                {link.name}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <NavLink href="/about" active={isActive("/about")}>
        About
      </NavLink>

      <Link
        href="/contact"
        className={cn(
          "ml-2 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all",
          isActive("/contact")
            ? "bg-brand text-brand-foreground shadow-glow"
            : "border border-brand/30 bg-brand/5 text-brand hover:bg-brand/10",
        )}
      >
        <Icon name="phone" size={14} />
        Contact Us
      </Link>
    </nav>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  const { user } = useSession();
  const { isAuthenticated, isSupplier } = useAuth();
  const handleLogout = useLogout();

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
          <Menu size={20} />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="flex w-[320px] flex-col gap-0 p-0 sm:w-[360px]">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand shadow-glow">
              <Icon name="shopping-bag-solid" size={16} className="invert" />
            </div>
            <span className="font-bold">{SITE_NAME}</span>
          </Link>
          <SheetClose asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Close menu">
              <X size={18} />
            </Button>
          </SheetClose>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <form action="/products" className="mb-5">
            <div className="relative">
              <Icon
                name="search"
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50"
              />
              <Input name="q" placeholder="Search products..." className="h-10 rounded-full pl-9" />
            </div>
          </form>

          {isAuthenticated && user.id ? (
            <div className="mb-5 rounded-xl border bg-muted/40 p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/15 text-sm font-bold text-brand">
                  {user.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{user.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                  <RoleBadge role={user.role} className="mt-1 w-fit" />
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <SheetClose asChild>
                  <Link
                    href="/account/orders"
                    className="flex rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted"
                  >
                    My Orders
                  </Link>
                </SheetClose>
                {isAdminRole(user.role) && (
                  <SheetClose asChild>
                    <Link href="/admin" className="flex rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted">
                      Admin Panel
                    </Link>
                  </SheetClose>
                )}
                {isSupplier && (
                  <SheetClose asChild>
                    <Link href="/supplier" className="flex rounded-lg px-3 py-2 text-sm font-medium hover:bg-muted">
                      Supplier Portal
                    </Link>
                  </SheetClose>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-500/10"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <SheetClose asChild>
              <Link
                href="/login"
                className="mb-5 flex w-full items-center justify-center rounded-xl border border-brand/30 bg-brand/5 px-4 py-2.5 text-sm font-semibold text-brand"
              >
                Sign In
              </Link>
            </SheetClose>
          )}

          <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Menu
          </p>
          <nav className="space-y-0.5">
            {NAV_LINKS.filter((l) => l.href !== "/categories").map((link) => (
              <SheetClose key={link.href} asChild>
                <Link
                  href={link.href}
                  className={cn(
                    "flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive(link.href)
                      ? "bg-brand/10 text-brand"
                      : "hover:bg-muted",
                  )}
                >
                  {link.name}
                </Link>
              </SheetClose>
            ))}
            <SheetClose asChild>
              <Link
                href="/products?deals=flash"
                className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-500/5"
              >
                <Icon name="bolt" size={14} />
                Flash Deals
              </Link>
            </SheetClose>
          </nav>

          <div className="my-4 border-t" />

          <div className="mb-2 flex items-center justify-between px-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Categories
            </p>
            <SheetClose asChild>
              <Link href="/categories" className="text-xs font-medium text-brand">
                All
              </Link>
            </SheetClose>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {NAV_CATEGORIES.map((cat) => (
              <SheetClose key={cat.slug} asChild>
                <Link
                  href={`/categories/${cat.slug}`}
                  className="group overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md"
                >
                  <div className="relative h-16 w-full bg-muted">
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      sizes="160px"
                    />
                  </div>
                  <p className="px-2 py-2 text-xs font-medium">{cat.name}</p>
                </Link>
              </SheetClose>
            ))}
          </div>

          <div className="my-4 border-t" />

          <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Support
          </p>
          <nav className="space-y-0.5">
            {SUPPORT_LINKS.map((link) => (
              <SheetClose key={link.href} asChild>
                <Link
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-colors",
                    isActive(link.href) ? "bg-brand/10 text-brand" : "hover:bg-muted",
                  )}
                >
                  <Icon name={link.icon} size={16} />
                  {link.name}
                </Link>
              </SheetClose>
            ))}
          </nav>
        </div>

        <div className="border-t bg-muted/30 p-4">
          <SheetClose asChild>
            <Link
              href="/contact"
              className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground shadow-glow transition-opacity hover:opacity-90"
            >
              <Icon name="phone" size={16} className="invert" />
              Contact Us
            </Link>
          </SheetClose>
          <div className="space-y-2 text-sm text-muted-foreground">
            <a href={`tel:+${CONTACT.whatsapp}`} className="flex items-center gap-2 hover:text-foreground">
              <Icon name="phone" size={14} />
              {CONTACT.phoneDisplay}
            </a>
            <a href={`mailto:${CONTACT.email}`} className="flex items-center gap-2 hover:text-foreground">
              <Icon name="mail" size={14} />
              {CONTACT.email}
            </a>
          </div>
          <SocialLinks size={20} className="mt-3" />
        </div>
      </SheetContent>
    </Sheet>
  );
}
