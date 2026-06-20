import type { Metadata } from "next";
import { ScrollReveal } from "@/modules/storefront-ui/animations/scroll-reveal";

export const metadata: Metadata = { title: "Returns & Refunds" };

export default function ReturnsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <ScrollReveal>
        <h1 className="text-4xl font-bold tracking-tight">Returns & Refunds</h1>
        <p className="mt-2 text-muted-foreground">7-day hassle-free returns on all products</p>
      </ScrollReveal>
      <div className="mt-10 space-y-6">
        {[
          { step: "1", title: "Request a Return", desc: "Go to My Orders and click 'Return' within 7 days of delivery." },
          { step: "2", title: "Pack the Item", desc: "Use original packaging. Include all accessories and tags." },
          { step: "3", title: "Schedule Pickup", desc: "We'll arrange a free pickup from your address within 24 hours." },
          { step: "4", title: "Get Refunded", desc: "Refund processed within 5–7 business days to original payment method." },
        ].map((item, i) => (
          <ScrollReveal key={item.step} delay={i * 0.08}>
            <div className="flex gap-4 rounded-xl border p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-lg font-bold text-emerald-700">
                {item.step}
              </div>
              <div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
}
