import type { Metadata } from "next";
import { ScrollReveal } from "@/modules/storefront-ui/animations/scroll-reveal";
import { Icon } from "@/components/shared/icon";
import { TRUST_BADGES } from "@/lib/constants";

export const metadata: Metadata = { title: "Shipping Information" };

export default function ShippingPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <ScrollReveal>
        <h1 className="text-4xl font-bold tracking-tight">Shipping Information</h1>
        <p className="mt-2 text-muted-foreground">Fast delivery from nearby warehouses across India</p>
      </ScrollReveal>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {TRUST_BADGES.map((b) => (
          <ScrollReveal key={b.title}>
            <div className="flex gap-3 rounded-xl border p-4">
              <Icon name={b.icon} size={22} />
              <div>
                <p className="font-semibold">{b.title}</p>
                <p className="text-sm text-muted-foreground">{b.desc}</p>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
      <ScrollReveal delay={0.2}>
        <div className="prose mt-10 space-y-4">
          <h2 className="text-xl font-semibold">Delivery Timeline</h2>
          <ul className="space-y-2 text-muted-foreground">
            <li>Metro cities (Mumbai, Delhi, Bangalore): 2–3 days</li>
            <li>Tier 2 cities: 3–4 days</li>
            <li>Other locations: 4–5 days</li>
          </ul>
          <h2 className="text-xl font-semibold">Shipping Charges</h2>
          <ul className="space-y-2 text-muted-foreground">
            <li>Free shipping on orders above ₹999</li>
            <li>₹49 flat rate for orders below ₹999</li>
          </ul>
        </div>
      </ScrollReveal>
    </div>
  );
}
