"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icon } from "@/components/shared/icon";
import { RoleBadge } from "@/components/shared/role-badge";
import { useSession } from "@/modules/auth/session-context";
import { useAuth } from "@/hooks/use-auth";
import { useLogout } from "@/hooks/use-logout";
import { useCartStore } from "@/modules/cart/store/cart-store";
import { useMounted } from "@/hooks/use-mounted";
import { SITE_NAME, NAV_CATEGORIES, CONTACT } from "@/lib/constants";
import { SocialLinks } from "@/components/shared/social-links";
import { isAdminRole, getRoleHomePath } from "@/lib/auth/roles";
import { CartDrawer } from "@/components/storefront/cart/cart-drawer";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { DesktopNav, MobileNav } from "@/components/storefront/layout/storefront-nav";
import { cn } from "@/lib/utils";

export function StorefrontHeader() {
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useSession();
  const { isAuthenticated, isSupplier } = useAuth();
  const handleLogout = useLogout();
  const mounted = useMounted();
  const itemCount = useCartStore((s) => s.itemCount());
  const displayCount = mounted ? itemCount : 0;

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
      <div className="border-b border-border/30 bg-brand/5">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-1.5 text-xs">
          <span className="truncate text-muted-foreground">
            Free shipping on orders above <span className="font-medium text-foreground">₹999</span>
          </span>
          <div className="hidden shrink-0 items-center gap-5 sm:flex">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Icon name="map-pin" size={12} />
              Mumbai, India
            </span>
            <Link
              href="/contact"
              className="font-medium text-brand transition-opacity hover:opacity-80"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center gap-3 lg:gap-6">
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand shadow-glow">
              <Icon name="shopping-bag-solid" size={18} className="invert" />
            </div>
            <span className="text-lg font-bold tracking-tight lg:text-xl">{SITE_NAME}</span>
          </Link>

          <DesktopNav />

          <form
            action="/products"
            className="hidden flex-1 lg:flex lg:max-w-md xl:max-w-lg"
            onSubmit={(e) => {
              if (!searchQuery.trim()) e.preventDefault();
            }}
          >
            <div className="relative w-full">
              <Icon
                name="search"
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-40"
              />
              <Input
                name="q"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="h-10 rounded-full border-muted bg-muted/40 pl-10 pr-4 transition-colors focus:bg-background"
              />
            </div>
          </form>

          <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
            <div className="flex items-center rounded-full border border-border/60 bg-muted/30 p-0.5">
              <ThemeToggle />
              {isAuthenticated && user.id ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 gap-2 rounded-full px-2 sm:px-3">
                      <Icon name="user" size={16} />
                      <span className="hidden max-w-[100px] truncate text-sm sm:inline">
                        {user.name.split(" ")[0]}
                      </span>
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
                      <Link href={getRoleHomePath(user.role)}>Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/account/orders">My Orders</Link>
                    </DropdownMenuItem>
                    {isAdminRole(user.role) && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin">Admin Panel</Link>
                      </DropdownMenuItem>
                    )}
                    {isSupplier && (
                      <DropdownMenuItem asChild>
                        <Link href="/supplier">Supplier Portal</Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant="ghost" size="sm" className="h-8 rounded-full px-3" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
              )}
            </div>

            <CartDrawer>
              <Button variant="ghost" size="icon" className="relative rounded-full" aria-label="Shopping cart">
                <Icon name="shopping-cart" size={20} />
                {displayCount > 0 && (
                  <Badge className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-background bg-brand p-0 text-[10px] text-brand-foreground">
                    {displayCount}
                  </Badge>
                )}
              </Button>
            </CartDrawer>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full lg:hidden" aria-label="Search">
                  <Icon name="search" size={20} />
                </Button>
              </SheetTrigger>
              <SheetContent side="top" className="pt-14">
                <form action="/products">
                  <div className="relative">
                    <Icon
                      name="search"
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40"
                    />
                    <Input name="q" placeholder="Search products..." className="h-11 rounded-full pl-10" />
                  </div>
                </form>
              </SheetContent>
            </Sheet>

            <MobileNav />
          </div>
        </div>
      </div>
    </header>
  );
}

export function StorefrontFooter() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Icon name="shopping-bag-solid" size={16} className="invert" />
            </div>
            <span className="font-bold">{SITE_NAME}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            India&apos;s smart dropshipping marketplace. Fast delivery from nearby warehouses.
          </p>
          <div className="flex items-center gap-3">
            <Image src="/icons/razorpay.png" alt="Razorpay" width={60} height={24} />
            <Image src="/icons/stripe.png" alt="Stripe" width={48} height={24} />
          </div>
          <SocialLinks size={20} className="pt-1" />
        </div>
        <div>
          <h4 className="mb-3 font-semibold">Shop</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {NAV_CATEGORIES.map((cat) => (
              <li key={cat.slug}>
                <Link href={`/categories/${cat.slug}`} className="hover:text-foreground">
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="mb-3 font-semibold">Support</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/contact" className="hover:text-foreground">Contact Us</Link></li>
            <li><Link href="/help" className="hover:text-foreground">Help Center</Link></li>
            <li><Link href="/returns" className="hover:text-foreground">Returns</Link></li>
            <li><Link href="/shipping" className="hover:text-foreground">Shipping Info</Link></li>
          </ul>
          <div className="mt-4 space-y-1.5 text-sm text-muted-foreground">
            <a href={`tel:+${CONTACT.whatsapp}`} className="flex items-center gap-2 hover:text-foreground">
              <Icon name="phone" size={14} />
              {CONTACT.phoneDisplay}
            </a>
            <a href={`mailto:${CONTACT.email}`} className="flex items-center gap-2 hover:text-foreground">
              <Icon name="mail" size={14} />
              {CONTACT.email}
            </a>
          </div>
        </div>
        <div>
          <h4 className="mb-3 font-semibold">Company</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link href="/about" className="hover:text-foreground">About Us</Link></li>
            <li><Link href="/blog" className="hover:text-foreground">Blog</Link></li>
            <li><Link href="/admin" className="hover:text-foreground">Admin</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">
        © 2026 {SITE_NAME}. All rights reserved.
      </div>
    </footer>
  );
}
