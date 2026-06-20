import type { Metadata } from "next";
import { ScrollReveal } from "@/modules/storefront-ui/animations/scroll-reveal";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = { title: "About Us" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <ScrollReveal>
        <h1 className="text-4xl font-bold tracking-tight">About {SITE_NAME}</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          India&apos;s smart dropshipping marketplace connecting buyers with nearby warehouses for faster, cheaper delivery.
        </p>
      </ScrollReveal>
      <div className="prose prose-slate mt-10 max-w-none space-y-6">
        <ScrollReveal delay={0.1}>
          <h2 className="text-xl font-semibold">Our Mission</h2>
          <p className="text-muted-foreground">
            We believe every Indian deserves access to quality products at fair prices, delivered quickly from local warehouses. Our geo-boosted platform matches you with the nearest supplier for 2–5 day delivery nationwide.
          </p>
        </ScrollReveal>
        <ScrollReveal delay={0.2}>
          <h2 className="text-xl font-semibold">How It Works</h2>
          <ul className="space-y-2 text-muted-foreground">
            <li>1. Browse 12+ categories and 1000s of products</li>
            <li>2. Order with Razorpay, Stripe, or Cash on Delivery</li>
            <li>3. We route your order to the nearest warehouse</li>
            <li>4. Fast delivery via Shiprocket / Delhivery</li>
          </ul>
        </ScrollReveal>
        <ScrollReveal delay={0.3}>
          <h2 className="text-xl font-semibold">For Suppliers</h2>
          <p className="text-muted-foreground">
            Join our supplier network and reach millions of buyers across India. List products, manage inventory, and grow your business with zero upfront inventory cost.
          </p>
        </ScrollReveal>
      </div>
    </div>
  );
}
