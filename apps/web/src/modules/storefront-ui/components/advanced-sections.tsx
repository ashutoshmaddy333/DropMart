"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/shared/icon";
import { TiltCard } from "@/modules/storefront-ui/animations/tilt-card";
import { ScrollReveal, StaggerGrid, StaggerItem } from "@/modules/storefront-ui/animations/scroll-reveal";
import { TRUST_BADGES } from "@/lib/constants";

export function AdvancedTrustBadges() {
  return (
    <StaggerGrid className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {TRUST_BADGES.map((badge) => (
        <StaggerItem key={badge.title}>
          <TiltCard tiltMax={6} scale={1.02}>
            <div className="flex items-start gap-4 rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-all hover:border-brand/30 hover:shadow-glow">
              <motion.div
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand/10 ring-1 ring-brand/20"
              >
                <Icon name={badge.icon} size={22} className="text-brand" />
              </motion.div>
              <div>
                <h3 className="font-semibold">{badge.title}</h3>
                <p className="mt-0.5 text-sm text-muted-foreground">{badge.desc}</p>
              </div>
            </div>
          </TiltCard>
        </StaggerItem>
      ))}
    </StaggerGrid>
  );
}

export function AdvancedCategoryGrid({
  categories,
}: {
  categories: readonly { name: string; slug: string; image: string }[];
}) {
  return (
    <section className="space-y-6">
      <ScrollReveal>
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Shop by Category</h2>
            <p className="text-muted-foreground">Curated collections for every need</p>
          </div>
          <Button variant="ghost" asChild>
            <Link href="/products">View All →</Link>
          </Button>
        </div>
      </ScrollReveal>
      <StaggerGrid className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((cat) => (
          <StaggerItem key={cat.slug}>
            <TiltCard tiltMax={5}>
              <Link
                href={`/categories/${cat.slug}`}
                className="group relative block aspect-[4/3] overflow-hidden rounded-2xl ring-1 ring-border/50 transition-all hover:ring-brand/40 hover:shadow-glow"
              >
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-0 p-5">
                  <motion.h3
                    className="text-lg font-bold text-white"
                    whileHover={{ x: 4 }}
                  >
                    {cat.name}
                  </motion.h3>
                </div>
              </Link>
            </TiltCard>
          </StaggerItem>
        ))}
      </StaggerGrid>
    </section>
  );
}
