"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Icon } from "@/components/shared/icon";
import { useCartStore } from "@/modules/cart/store/cart-store";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

const FREE_SHIPPING_THRESHOLD = 999;

function ShippingProgress({ subtotal }: { subtotal: number }) {
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const remaining = FREE_SHIPPING_THRESHOLD - subtotal;

  return (
    <div className="rounded-xl border border-brand/20 bg-brand/5 p-3">
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="font-medium text-brand">
          {remaining <= 0 ? "🎉 Free shipping unlocked!" : "Free shipping progress"}
        </span>
        <span className="text-muted-foreground">{Math.round(progress)}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-brand to-emerald-400"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      {remaining > 0 && (
        <p className="mt-2 text-xs text-muted-foreground">
          Add <strong className="text-brand">{formatCurrency(remaining)}</strong> more for free
          shipping
        </p>
      )}
    </div>
  );
}

export function CartDrawer({ children }: { children: React.ReactNode }) {
  const { items, updateQuantity, removeItem, subtotal, itemCount, drawerOpen, setDrawerOpen } =
    useCartStore();
  const count = itemCount();
  const total = subtotal();
  const shipping = total >= FREE_SHIPPING_THRESHOLD ? 0 : 49;

  return (
    <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="flex w-full flex-col border-l border-border/60 bg-background/95 backdrop-blur-xl sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10">
              <Icon name="shopping-cart" size={18} className="text-brand" />
            </div>
            Your Cart
            {count > 0 && (
              <span className="rounded-full bg-brand px-2 py-0.5 text-xs font-semibold text-brand-foreground">
                {count}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted ring-1 ring-border/60">
              <Icon name="shopping-cart" size={28} className="opacity-40" />
            </div>
            <p className="font-medium">Your cart is empty</p>
            <p className="text-sm text-muted-foreground">Browse products and add items to get started</p>
            <Button asChild className="bg-brand hover:bg-brand/90">
              <Link href="/products" onClick={() => setDrawerOpen(false)}>
                Browse Products
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto py-4">
              <ShippingProgress subtotal={total} />
              <AnimatePresence mode="popLayout">
                {items.map((item) => (
                  <motion.div
                    key={`${item.productId}-${item.variant}`}
                    layout
                    initial={{ opacity: 0, x: 24, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -24, scale: 0.95 }}
                    transition={{ duration: 0.25 }}
                    className="flex gap-3 rounded-xl border border-border/60 bg-card p-3 shadow-sm"
                  >
                    <Link
                      href={`/products/${item.slug}`}
                      onClick={() => setDrawerOpen(false)}
                      className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border"
                    >
                      <Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px" />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/products/${item.slug}`}
                        onClick={() => setDrawerOpen(false)}
                        className="line-clamp-1 text-sm font-medium hover:text-brand"
                      >
                        {item.name}
                      </Link>
                      {item.variant && (
                        <p className="text-xs text-muted-foreground">{item.variant}</p>
                      )}
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center rounded-lg border border-border/60 bg-muted/30">
                          <button
                            type="button"
                            className="px-2.5 py-1 text-sm transition-colors hover:bg-muted"
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity - 1, item.variant)
                            }
                          >
                            −
                          </button>
                          <span className="w-7 text-center text-xs font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            className="px-2.5 py-1 text-sm transition-colors hover:bg-muted"
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity + 1, item.variant)
                            }
                          >
                            +
                          </button>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold">
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                          {item.mrp > item.price && (
                            <p className="text-[10px] text-muted-foreground line-through">
                              {formatCurrency(item.mrp * item.quantity)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="self-start rounded-md p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => removeItem(item.productId, item.variant)}
                      aria-label="Remove item"
                    >
                      ×
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="space-y-3 border-t border-border/60 pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className={cn(shipping === 0 && "font-medium text-brand")}>
                  {shipping === 0 ? "Free ✓" : formatCurrency(shipping)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-brand">{formatCurrency(total + shipping)}</span>
              </div>
              <Button
                asChild
                className="w-full bg-brand shadow-glow hover:bg-brand/90"
                size="lg"
              >
                <Link href="/checkout" onClick={() => setDrawerOpen(false)}>
                  Proceed to Checkout
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/cart" onClick={() => setDrawerOpen(false)}>
                  View Full Cart
                </Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
