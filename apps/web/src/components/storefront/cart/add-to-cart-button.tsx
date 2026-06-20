"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/shared/icon";
import { useCartStore } from "@/modules/cart/store/cart-store";
import type { Product } from "@/modules/products/types";
import { cn } from "@/lib/utils";

const EASE = [0.25, 0.1, 0.25, 1] as const;

interface AddToCartButtonProps {
  product: Product;
  quantity?: number;
  variant?: string;
  size?: "sm" | "default" | "lg";
  className?: string;
  fullWidth?: boolean;
  openDrawer?: boolean;
  label?: string;
}

function CartAddedToast({
  name,
  image,
  quantity,
  variant,
}: {
  name: string;
  image: string;
  quantity: number;
  variant?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-border/60 bg-muted">
        <Image src={image} alt={name} fill className="object-cover" sizes="44px" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold">Added to your cart</p>
        <p className="truncate text-xs text-muted-foreground">
          {name} · Qty {quantity}
          {variant ? ` · ${variant}` : ""}
        </p>
      </div>
    </div>
  );
}

export function AddToCartButton({
  product,
  quantity = 1,
  variant,
  size = "default",
  className,
  fullWidth,
  openDrawer = false,
  label = "Add to Cart",
}: AddToCartButtonProps) {
  const [status, setStatus] = useState<"idle" | "adding" | "success">("idle");
  const addItem = useCartStore((s) => s.addItem);
  const setDrawerOpen = useCartStore((s) => s.setDrawerOpen);

  const handleClick = useCallback(async () => {
    if (!product.inStock || status === "adding") return;

    setStatus("adding");
    addItem(product, quantity, variant);

    await new Promise((r) => setTimeout(r, 280));
    setStatus("success");

    toast.custom(
      (t) => (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.25, ease: EASE }}
          className="flex w-full max-w-sm items-center justify-between gap-3 rounded-xl border border-border/60 bg-card p-3.5 shadow-lg"
        >
          <CartAddedToast
            name={product.name}
            image={product.images[0]}
            quantity={quantity}
            variant={variant}
          />
          <button
            type="button"
            onClick={() => {
              toast.dismiss(t);
              setDrawerOpen(true);
            }}
            className="shrink-0 rounded-lg border border-brand/30 bg-brand/10 px-3 py-1.5 text-xs font-medium text-brand transition-colors hover:bg-brand hover:text-brand-foreground"
          >
            View cart
          </button>
        </motion.div>
      ),
      { duration: 3500 }
    );

    if (openDrawer) {
      setTimeout(() => setDrawerOpen(true), 400);
    }

    setTimeout(() => setStatus("idle"), 900);
  }, [product, quantity, variant, status, addItem, openDrawer, setDrawerOpen]);

  return (
    <Button
      size={size}
      disabled={!product.inStock || status === "adding"}
      onClick={handleClick}
      className={cn(
        "relative overflow-hidden bg-brand font-medium text-brand-foreground transition-colors hover:bg-brand/90",
        fullWidth && "w-full",
        status === "success" && "ring-2 ring-white/20",
        className
      )}
    >
      <AnimatePresence mode="wait">
        {status === "idle" && (
          <motion.span
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-2"
          >
            <Icon name="shopping-cart" size={size === "sm" ? 14 : 18} className="invert" />
            {label}
          </motion.span>
        )}
        {status === "adding" && (
          <motion.span
            key="adding"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex items-center gap-2"
          >
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="inline-block h-3.5 w-3.5 rounded-full border-2 border-white/25 border-t-white"
            />
            Adding
          </motion.span>
        )}
        {status === "success" && (
          <motion.span
            key="success"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: EASE }}
            className="flex items-center gap-2"
          >
            <motion.span
              initial={{ pathLength: 0 }}
              className="flex h-4 w-4 items-center justify-center rounded-full bg-white/20 text-xs"
            >
              ✓
            </motion.span>
            Added
          </motion.span>
        )}
      </AnimatePresence>
    </Button>
  );
}
