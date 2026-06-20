import type { Metadata } from "next";
import { CartView } from "@/components/storefront/cart/cart-view";
import { ScrollReveal } from "@/modules/storefront-ui/animations/scroll-reveal";

export const metadata: Metadata = {
  title: "Shopping Cart",
};

export default function CartPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <ScrollReveal>
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight">Shopping Cart</h1>
          <p className="mt-1 text-muted-foreground">Review items and proceed to checkout</p>
        </div>
      </ScrollReveal>
      <CartView />
    </div>
  );
}
