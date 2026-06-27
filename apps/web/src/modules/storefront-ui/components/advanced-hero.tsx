"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/shared/icon";
import { MagneticButton } from "../animations/magnetic-button";
import { fadeInUp, slideInLeft } from "../animations/scroll-reveal";
import { useMounted } from "@/hooks/use-mounted";

const HeroDropshipVisual = dynamic(
  () => import("../three/hero-dropship-visual").then((m) => m.HeroDropshipVisual),
  {
    ssr: false,
    loading: () => <HeroStaticLoading />,
  },
);

function HeroStaticLoading() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-br from-emerald-900/40 via-slate-900 to-indigo-900/30">
      <div className="absolute inset-0 animate-pulse bg-[radial-gradient(ellipse_at_50%_50%,rgba(52,211,153,0.2),transparent_60%)]" />
      <div className="absolute bottom-4 left-4 h-2 w-24 animate-pulse rounded-full bg-emerald-500/30" />
    </div>
  );
}

export function AdvancedHeroBanner() {
  const mounted = useMounted();
  const motionInitial = mounted ? "hidden" : false;

  return (
    <section className="relative min-h-[420px] overflow-hidden rounded-2xl hero-bg sm:min-h-[540px] sm:rounded-3xl md:min-h-[620px]">
      {/* Animated gradient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 animate-pulse-glow rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 animate-pulse-glow rounded-full bg-indigo-500/15 blur-3xl [animation-delay:1.5s]" />
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-500/10 blur-3xl" />
      </div>

      {/* Grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />

      {/* Top shine */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-6 px-4 py-10 sm:gap-8 sm:px-6 sm:py-16 md:grid-cols-2 md:py-20">
        {/* Copy */}
        <div className="relative z-10 space-y-6">
          <motion.div
            initial={motionInitial}
            animate="visible"
            variants={fadeInUp}
            className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-1.5 text-sm text-emerald-300 backdrop-blur-md"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            <Icon name="bolt" size={14} className="invert" />
            Flash Sale — Up to 60% Off
          </motion.div>

          <motion.h1
            initial={motionInitial}
            animate="visible"
            variants={slideInLeft}
            transition={{ delay: 0.1 }}
            className="text-4xl font-extrabold leading-[1.08] tracking-tight text-white md:text-5xl lg:text-6xl"
          >
            Shop Smart.
            <br />
            <span className="text-gradient-brand">Delivered Fast.</span>
          </motion.h1>

          <motion.p
            initial={motionInitial}
            animate="visible"
            variants={fadeInUp}
            transition={{ delay: 0.2 }}
            className="max-w-md text-base leading-relaxed text-slate-300 md:text-lg"
          >
            Geo-boosted delivery from nearby warehouses. Premium products at dropship prices across India.
          </motion.p>

          <motion.div
            initial={motionInitial}
            animate="visible"
            variants={fadeInUp}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-3"
          >
            <MagneticButton>
              <Button
                size="lg"
                asChild
                className="bg-brand px-8 font-semibold text-brand-foreground shadow-glow hover:bg-brand/90 hover:shadow-glow-lg"
              >
                <Link href="/products">Shop Now</Link>
              </Button>
            </MagneticButton>
            <MagneticButton strength={0.2}>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-white/25 bg-white/10 px-8 font-semibold text-white backdrop-blur-sm hover:border-brand/50 hover:bg-white/15"
              >
                <Link href="/products?deals=flash">Flash Deals</Link>
              </Button>
            </MagneticButton>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={motionInitial}
            animate="visible"
            variants={fadeInUp}
            transition={{ delay: 0.45 }}
            className="flex gap-6 pt-2 md:gap-10"
          >
            {[
              { value: "12+", label: "Products" },
              { value: "2-5", label: "Day Delivery" },
              { value: "4.8★", label: "Rating" },
            ].map((stat) => (
              <div key={stat.label} className="border-l border-white/10 pl-4 first:border-0 first:pl-0">
                <p className="text-2xl font-bold text-brand">{stat.value}</p>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Dropshipping 3D visualization */}
        <div className="relative h-[240px] sm:h-[320px] md:h-[480px]">
          <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-transparent to-indigo-500/10 blur-2xl" />
          <div className="relative h-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-slate-950/40 to-black/30 shadow-2xl shadow-emerald-500/10 backdrop-blur-sm">
            <HeroDropshipVisual className="relative h-full w-full" />
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/20 to-transparent" />
    </section>
  );
}
