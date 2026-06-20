"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Icon } from "@/components/shared/icon";
import { useCartStore } from "@/modules/cart/store/cart-store";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

const FREE_SHIPPING_THRESHOLD = 999;

export function CartView() {
  const { items, updateQuantity, removeItem, subtotal } = useCartStore();
  const total = subtotal();
  const shipping = total >= FREE_SHIPPING_THRESHOLD ? 0 : 49;
  const progress = Math.min(100, (total / FREE_SHIPPING_THRESHOLD) * 100);

  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 py-24 text-center"
      >
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted ring-1 ring-border/60">
          <Icon name="shopping-cart" size={36} className="opacity-35" />
        </div>
        <h2 className="mt-6 text-2xl font-bold">Your cart is empty</h2>
        <p className="mt-2 max-w-sm text-muted-foreground">
          Explore our catalog and add products you&apos;d like to order.
        </p>
        <Button className="mt-8 bg-brand hover:bg-brand/90" size="lg" asChild>
          <Link href="/products">Start Shopping</Link>
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <div className="rounded-2xl border border-brand/20 bg-brand/5 p-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium">
              {total >= FREE_SHIPPING_THRESHOLD
                ? "🎉 You've unlocked free shipping!"
                : "Free shipping on orders above ₹999"}
            </span>
            <span className="text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-brand to-teal-400"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
          {total < FREE_SHIPPING_THRESHOLD && (
            <p className="mt-2 text-xs text-muted-foreground">
              Add {formatCurrency(FREE_SHIPPING_THRESHOLD - total)} more to get free delivery
            </p>
          )}
        </div>

        <AnimatePresence mode="popLayout">
          {items.map((item, i) => (
            <motion.div
              key={`${item.productId}-${item.variant}`}
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ delay: i * 0.05 }}
              className="flex gap-4 rounded-2xl border border-border/60 bg-card p-4 shadow-sm transition-all hover:border-brand/20 hover:shadow-glow"
            >
              <Link
                href={`/products/${item.slug}`}
                className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl border"
              >
                <Image src={item.image} alt={item.name} fill className="object-cover" sizes="112px" />
              </Link>
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <Link
                    href={`/products/${item.slug}`}
                    className="font-semibold transition-colors hover:text-brand"
                  >
                    {item.name}
                  </Link>
                  {item.variant && (
                    <p className="mt-0.5 text-sm text-muted-foreground">{item.variant}</p>
                  )}
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatCurrency(item.price)} each
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center rounded-xl border border-border/60 bg-muted/30">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variant)}
                    >
                      −
                    </Button>
                    <span className="w-10 text-center font-semibold">{item.quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variant)}
                    >
                      +
                    </Button>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{formatCurrency(item.price * item.quantity)}</p>
                    {item.mrp > item.price && (
                      <p className="text-xs text-muted-foreground line-through">
                        {formatCurrency(item.mrp * item.quantity)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 text-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                onClick={() => removeItem(item.productId, item.variant)}
                aria-label="Remove item"
              >
                ×
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="h-fit rounded-2xl border border-border/60 bg-card p-6 shadow-sm lg:sticky lg:top-24">
        <h3 className="text-lg font-bold">Order Summary</h3>
        <Separator className="my-4" />
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal ({items.length} items)</span>
            <span className="font-medium">{formatCurrency(total)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span className={cn(shipping === 0 && "font-medium text-brand")}>
              {shipping === 0 ? "Free" : formatCurrency(shipping)}
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
            <Icon name="shield-check" size={14} />
            Secure checkout · Razorpay & Stripe
          </div>
        </div>
        <Separator className="my-4" />
        <div className="flex justify-between text-xl font-bold">
          <span>Total</span>
          <span className="text-brand">{formatCurrency(total + shipping)}</span>
        </div>
        <Button className="mt-6 w-full bg-brand shadow-glow hover:bg-brand/90" size="lg" asChild>
          <Link href="/checkout">Proceed to Checkout</Link>
        </Button>
        <Button className="mt-2 w-full" variant="outline" asChild>
          <Link href="/products">Continue Shopping</Link>
        </Button>
      </div>
    </div>
  );
}
