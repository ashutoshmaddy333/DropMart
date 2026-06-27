"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";

const HeroPhone3DScene = dynamic(
  () => import("./hero-phone-3d-scene").then((m) => m.HeroPhone3DScene),
  { ssr: false },
);

function HeroPhoneFallback() {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <div className="relative w-[140px] rounded-[2rem] border border-white/10 bg-[#1a1a1a] p-2 shadow-2xl shadow-emerald-500/10 sm:w-[168px]">
        <div className="aspect-[9/19] overflow-hidden rounded-[1.5rem] bg-[#0d0d0d]">
          <div className="mx-auto mt-3 h-4 w-16 rounded-full bg-black" />
          <div className="mx-3 mt-5 rounded-2xl border border-white/10 bg-[#1c1c1e] p-3">
            <div className="flex gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-xs text-white">
                🛒
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Order placed</p>
                <p className="text-[10px] text-gray-500">Payment confirmed</p>
              </div>
            </div>
            <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-[65%] animate-pulse rounded-full bg-emerald-500" />
            </div>
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_60%,rgba(16,185,129,0.15),transparent_65%)]" />
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

type VisualMode = "3d-full" | "3d-lite" | "fallback" | "loading";

export function HeroDropshipVisual({ className }: { className?: string }) {
  const [mode, setMode] = useState<VisualMode>("loading");

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    const webgl = canUseWebGL();

    if (reduced || !webgl) {
      setMode("fallback");
    } else if (mobile) {
      setMode("3d-lite");
    } else {
      setMode("3d-full");
    }
  }, []);

  if (mode === "loading") {
    return <HeroPhoneFallback />;
  }

  if (mode === "fallback") {
    return (
      <div className={cn("relative h-full w-full", className)}>
        <HeroPhoneFallback />
      </div>
    );
  }

  return (
    <div className={cn("relative h-full w-full", className)}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_55%,rgba(16,185,129,0.12),transparent_60%)]" />
      <HeroPhone3DScene className="h-full w-full" lite={mode === "3d-lite"} />
    </div>
  );
}
