import type { Metadata } from "next";
import Link from "next/link";
import { ScrollReveal } from "@/modules/storefront-ui/animations/scroll-reveal";
import { Icon } from "@/components/shared/icon";

export const metadata: Metadata = { title: "Help Center" };

const FAQ = [
  { q: "How do I track my order?", a: "Go to My Orders in your account. You'll see tracking ID once shipped." },
  { q: "What payment methods do you accept?", a: "Razorpay (UPI, cards, net banking), Stripe (international cards), and Cash on Delivery." },
  { q: "How long does delivery take?", a: "2–5 business days depending on your location and nearest warehouse." },
  { q: "Can I return a product?", a: "Yes, within 7 days of delivery. See our Returns Policy for details." },
  { q: "Is free shipping available?", a: "Free shipping on all orders above ₹999." },
];

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <ScrollReveal>
        <h1 className="text-4xl font-bold tracking-tight">Help Center</h1>
        <p className="mt-2 text-muted-foreground">Find answers to common questions</p>
      </ScrollReveal>
      <div className="mt-10 space-y-4">
        {FAQ.map((item, i) => (
          <ScrollReveal key={item.q} delay={i * 0.05}>
            <div className="rounded-xl border bg-card p-5">
              <h3 className="font-semibold">{item.q}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.a}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>
      <ScrollReveal delay={0.3}>
        <div className="mt-10 rounded-xl border bg-emerald-50 p-6 dark:bg-emerald-950/20">
          <div className="flex items-center gap-3">
            <Icon name="bell" size={24} />
            <div>
              <p className="font-semibold">Still need help?</p>
              <p className="text-sm text-muted-foreground">Email us at support@dropmart.in</p>
            </div>
          </div>
          <Link href="/account/orders" className="mt-4 inline-block text-sm text-emerald-600 hover:underline">
            View My Orders →
          </Link>
        </div>
      </ScrollReveal>
    </div>
  );
}
