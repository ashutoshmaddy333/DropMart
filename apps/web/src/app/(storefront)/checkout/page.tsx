import type { Metadata } from "next";
import { CheckoutView } from "@/components/storefront/checkout/checkout-view";

export const metadata: Metadata = {
  title: "Checkout",
};

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">Checkout</h1>
      <CheckoutView />
    </div>
  );
}
