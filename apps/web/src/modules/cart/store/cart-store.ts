"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/modules/products/types";

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  price: number;
  mrp: number;
  image: string;
  quantity: number;
  variant?: string;
}

interface CartStore {
  items: CartItem[];
  drawerOpen: boolean;
  addItem: (product: Product, quantity?: number, variant?: string) => void;
  removeItem: (productId: string, variant?: string) => void;
  updateQuantity: (productId: string, quantity: number, variant?: string) => void;
  clearCart: () => void;
  setDrawerOpen: (open: boolean) => void;
  itemCount: () => number;
  subtotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      drawerOpen: false,
      setDrawerOpen: (open) => set({ drawerOpen: open }),
      addItem: (product, quantity = 1, variant) => {
        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === product.id && i.variant === variant
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === product.id && i.variant === variant
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                productId: product.id,
                slug: product.slug,
                name: product.name,
                price: product.price,
                mrp: product.mrp,
                image: product.images[0],
                quantity,
                variant,
              },
            ],
          };
        });
      },
      removeItem: (productId, variant) =>
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.productId === productId && (variant === undefined || i.variant === variant))
          ),
        })),
      updateQuantity: (productId, quantity, variant) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter(
                  (i) => !(i.productId === productId && (variant === undefined || i.variant === variant))
                )
              : state.items.map((i) =>
                  i.productId === productId && (variant === undefined || i.variant === variant)
                    ? { ...i, quantity }
                    : i
                ),
        })),
      clearCart: () => set({ items: [] }),
      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    { name: "dropmart-cart", partialize: (state) => ({ items: state.items }), skipHydration: true }
  )
);
