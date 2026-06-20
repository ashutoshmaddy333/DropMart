import type { Metadata } from "next";
import Link from "next/link";
import { ScrollReveal } from "@/modules/storefront-ui/animations/scroll-reveal";
import { Icon } from "@/components/shared/icon";
import { SocialLinks } from "@/components/shared/social-links";
import { Button } from "@/components/ui/button";
import { CONTACT, SITE_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Contact Us" };

const CONTACT_METHODS = [
  {
    icon: "phone" as const,
    title: "Call Us",
    value: CONTACT.phoneDisplay,
    href: `tel:+${CONTACT.whatsapp}`,
    description: "Mon–Sat, 10 AM – 7 PM IST",
    accent: "from-blue-500/10 to-blue-600/5 border-blue-500/20",
    iconBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  {
    icon: "mail" as const,
    title: "Email Us",
    value: CONTACT.email,
    href: `mailto:${CONTACT.email}`,
    description: "We reply within 24 hours",
    accent: "from-violet-500/10 to-violet-600/5 border-violet-500/20",
    iconBg: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  },
  {
    icon: "whatsapp" as const,
    title: "WhatsApp",
    value: CONTACT.phoneDisplay,
    href: `https://wa.me/${CONTACT.whatsapp}`,
    description: "Chat with us instantly",
    accent: "from-emerald-500/10 to-emerald-600/5 border-emerald-500/20",
    iconBg: "bg-emerald-500/10 text-[#25D366]",
    external: true,
  },
  {
    icon: "instagram" as const,
    title: "Instagram",
    value: "@dropmart",
    href: CONTACT.instagram || undefined,
    description: "Follow us for updates & deals",
    accent: "from-pink-500/10 to-rose-600/5 border-pink-500/20",
    iconBg: "bg-pink-500/10 text-[#E4405F]",
    external: true,
    comingSoon: !CONTACT.instagram,
  },
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <ScrollReveal>
        <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-brand/5 via-background to-background p-8 md:p-12">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand/10 blur-3xl" />
          <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-brand/5 blur-2xl" />
          <div className="relative">
            <p className="text-sm font-medium uppercase tracking-wider text-brand">Get in Touch</p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">Contact Us</h1>
            <p className="mt-4 max-w-xl text-lg text-muted-foreground">
              Have a question about your order, returns, or partnerships? The {SITE_NAME} team is here to help.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg" className="gap-2 shadow-glow">
                <Link href={`https://wa.me/${CONTACT.whatsapp}`} target="_blank" rel="noopener noreferrer">
                  <Icon name="whatsapp" size={18} className="text-white" />
                  Chat on WhatsApp
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="gap-2">
                <Link href={`mailto:${CONTACT.email}`}>
                  <Icon name="mail" size={18} />
                  Send Email
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </ScrollReveal>

      <div className="mt-12 grid gap-5 sm:grid-cols-2">
        {CONTACT_METHODS.map((method, i) => (
          <ScrollReveal key={method.title} delay={i * 0.08}>
            <ContactCard method={method} />
          </ScrollReveal>
        ))}
      </div>

      <ScrollReveal delay={0.35}>
        <div className="mt-12 rounded-2xl border bg-card p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Connect on Social Media</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Stay updated with new arrivals, flash deals, and exclusive offers.
              </p>
            </div>
            <SocialLinks size={24} showLabels />
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={0.4}>
        <div className="mt-8 grid gap-4 rounded-2xl border bg-muted/30 p-6 md:grid-cols-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand/10">
              <Icon name="map-pin" size={18} className="text-brand" />
            </div>
            <div>
              <p className="font-medium">Location</p>
              <p className="text-sm text-muted-foreground">Mumbai, India</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand/10">
              <Icon name="truck" size={18} className="text-brand" />
            </div>
            <div>
              <p className="font-medium">Delivery</p>
              <p className="text-sm text-muted-foreground">Pan-India, 2–5 business days</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand/10">
              <Icon name="bell" size={18} className="text-brand" />
            </div>
            <div>
              <p className="font-medium">Support Hours</p>
              <p className="text-sm text-muted-foreground">Mon–Sat, 10 AM – 7 PM</p>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
}

function ContactCard({
  method,
}: {
  method: (typeof CONTACT_METHODS)[number];
}) {
  const inner = (
    <>
      <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", method.iconBg)}>
        <Icon name={method.icon} size={24} />
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-muted-foreground">{method.title}</p>
        <p className="mt-1 text-lg font-semibold tracking-tight">{method.value}</p>
        <p className="mt-1 text-sm text-muted-foreground">{method.description}</p>
        {method.comingSoon && (
          <span className="mt-2 inline-block rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            Link coming soon
          </span>
        )}
      </div>
    </>
  );

  const cardClass = cn(
    "group block h-full rounded-2xl border bg-gradient-to-br p-6 transition-all duration-300",
    method.accent,
    method.href && "hover:-translate-y-1 hover:shadow-lg hover:shadow-brand/5",
  );

  if (!method.href) {
    return <div className={cardClass}>{inner}</div>;
  }

  return (
    <Link
      href={method.href}
      target={method.external ? "_blank" : undefined}
      rel={method.external ? "noopener noreferrer" : undefined}
      className={cardClass}
    >
      {inner}
    </Link>
  );
}
