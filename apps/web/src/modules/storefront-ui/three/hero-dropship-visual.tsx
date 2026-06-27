"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";

const Hero3DScene = dynamic(
  () => import("./hero-3d-scene").then((m) => m.Hero3DScene),
  { ssr: false },
);

const HeroGenerativeScene = dynamic(
  () => import("../effects/hero-generative-scene").then((m) => m.HeroGenerativeScene),
  { ssr: false },
);

function HeroVisualLoading() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-gradient-to-br from-emerald-900/40 via-slate-900 to-indigo-900/30">
      <div className="absolute inset-0 animate-pulse bg-[radial-gradient(ellipse_at_50%_50%,rgba(52,211,153,0.2),transparent_60%)]" />
      <div className="absolute bottom-4 left-4 flex items-center gap-2">
        <div className="h-2 w-2 animate-ping rounded-full bg-emerald-400" />
        <div className="h-2 w-28 animate-pulse rounded-full bg-emerald-500/30" />
      </div>
    </div>
  );
}

function canUseWebGL() {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl") ?? canvas.getContext("experimental-webgl"));
  } catch {
    return false;
  }
}

type VisualMode = "3d-full" | "3d-lite" | "canvas" | "loading";

export function HeroDropshipVisual({ className }: { className?: string }) {
  const [mode, setMode] = useState<VisualMode>("loading");

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    const webgl = canUseWebGL();

    if (reduced || !webgl) {
      setMode("canvas");
    } else if (mobile) {
      setMode("3d-lite");
    } else {
      setMode("3d-full");
    }
  }, []);

  if (mode === "loading") {
    return <HeroVisualLoading />;
  }

  if (mode === "canvas") {
    return <HeroGenerativeScene className={cn("h-full w-full", className)} />;
  }

  return (
    <div className={cn("relative h-full w-full", className)}>
      <Hero3DScene className="h-full w-full" lite={mode === "3d-lite"} />
      {/* HUD labels */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-3 top-3 rounded-lg border border-white/10 bg-black/30 px-2 py-1 backdrop-blur-sm sm:left-4 sm:top-4 sm:px-3 sm:py-1.5">
          <p className="text-[9px] font-semibold uppercase tracking-widest text-emerald-300/90 sm:text-[10px]">
            Supplier
          </p>
        </div>
        <div className="absolute bottom-3 right-3 rounded-lg border border-white/10 bg-black/30 px-2 py-1 backdrop-blur-sm sm:bottom-4 sm:right-4 sm:px-3 sm:py-1.5">
          <p className="text-[9px] font-semibold uppercase tracking-widest text-indigo-300/90 sm:text-[10px]">
            Customer
          </p>
        </div>
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-2.5 py-1 backdrop-blur-sm">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
          <span className="text-[10px] font-medium text-emerald-200">Dropship route live</span>
        </div>
      </div>
    </div>
  );
}
