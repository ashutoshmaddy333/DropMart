"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export function GradientMesh({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let angle = 0;
    let raf: number;
    function animate() {
      angle = (angle + 0.3) % 360;
      if (ref.current) {
        ref.current.style.background = `
          radial-gradient(ellipse at ${50 + Math.sin(angle * Math.PI / 180) * 20}% ${50 + Math.cos(angle * Math.PI / 180) * 20}%, rgba(52,211,153,0.15) 0%, transparent 50%),
          radial-gradient(ellipse at ${50 + Math.cos(angle * Math.PI / 180 * 1.3) * 25}% ${50 + Math.sin(angle * Math.PI / 180 * 1.3) * 25}%, rgba(99,102,241,0.12) 0%, transparent 50%),
          radial-gradient(ellipse at ${50 + Math.sin(angle * Math.PI / 180 * 0.7) * 30}% ${50 + Math.cos(angle * Math.PI / 180 * 0.7) * 15}%, rgba(244,63,94,0.08) 0%, transparent 50%)
        `;
      }
      raf = requestAnimationFrame(animate);
    }
    animate();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      ref={ref}
      className={cn("pointer-events-none absolute inset-0 transition-all duration-1000", className)}
    />
  );
}
