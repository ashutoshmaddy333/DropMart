"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface HeroGenerativeSceneProps {
  className?: string;
}

type Hub = { x: number; y: number; pulse: number; radius: number };
type RouteDot = { t: number; speed: number; route: number; glow: number };
type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
  hue: number;
};

function noise2(x: number, y: number, t: number) {
  return (
    Math.sin(x * 0.008 + t * 0.7) * Math.cos(y * 0.006 - t * 0.5) +
    Math.sin(x * 0.015 - t * 0.4 + y * 0.01) * 0.5 +
    Math.cos(x * 0.004 + y * 0.012 + t * 0.25) * 0.35
  );
}

function bezierPoint(
  t: number,
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number },
) {
  const u = 1 - t;
  return {
    x: u ** 3 * p0.x + 3 * u ** 2 * t * p1.x + 3 * u * t ** 2 * p2.x + t ** 3 * p3.x,
    y: u ** 3 * p0.y + 3 * u ** 2 * t * p1.y + 3 * u * t ** 2 * p2.y + t ** 3 * p3.y,
  };
}

export function HeroGenerativeScene({ className }: HeroGenerativeSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5, active: false });
  const [useStaticFallback, setUseStaticFallback] = useState(false);

  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setUseStaticFallback(mobile || reduced);
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseRef.current = {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
      active: true,
    };
  }, []);

  const onMouseLeave = useCallback(() => {
    mouseRef.current.active = false;
  }, []);

  useEffect(() => {
    if (useStaticFallback) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animId = 0;
    let w = 0;
    let h = 0;
    let dpr = 1;
    const particles: Particle[] = [];
    const routeDots: RouteDot[] = [];
    let hubs: Hub[] = [];
    let routes: ReturnType<typeof buildRoutes> = [];

    function buildRoutes(width: number, height: number) {
      const cx = width * 0.5;
      const cy = height * 0.52;
      return [
        {
          p0: { x: width * 0.08, y: height * 0.72 },
          p1: { x: width * 0.28, y: height * 0.35 },
          p2: { x: width * 0.62, y: height * 0.28 },
          p3: { x: width * 0.92, y: height * 0.58 },
        },
        {
          p0: { x: width * 0.15, y: height * 0.22 },
          p1: { x: width * 0.42, y: height * 0.55 },
          p2: { x: width * 0.68, y: height * 0.18 },
          p3: { x: width * 0.88, y: height * 0.38 },
        },
        {
          p0: { x: width * 0.05, y: height * 0.48 },
          p1: { x: width * 0.35, y: height * 0.62 },
          p2: { x: width * 0.55, y: height * 0.42 },
          p3: { x: cx, y: cy },
        },
      ];
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas!.clientWidth;
      h = canvas!.clientHeight;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      hubs = [
        { x: w * 0.5, y: h * 0.52, pulse: 0, radius: 42 },
        { x: w * 0.18, y: h * 0.68, pulse: 1.2, radius: 28 },
        { x: w * 0.82, y: h * 0.35, pulse: 2.4, radius: 32 },
        { x: w * 0.72, y: h * 0.78, pulse: 0.8, radius: 24 },
      ];
      routes = buildRoutes(w, h);

      particles.length = 0;
      const isMobile = w < 768;
      const count = isMobile
        ? Math.min(80, Math.floor((w * h) / 5000))
        : Math.min(280, Math.floor((w * h) / 2200));
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: 0,
          vy: 0,
          life: Math.random(),
          size: Math.random() * 1.8 + 0.4,
          hue: Math.random() > 0.65 ? 155 : 220 + Math.random() * 40,
        });
      }

      routeDots.length = 0;
      for (let r = 0; r < routes.length; r++) {
        for (let i = 0; i < 3; i++) {
          routeDots.push({
            t: Math.random(),
            speed: 0.0012 + Math.random() * 0.0018,
            route: r,
            glow: Math.random(),
          });
        }
      }
    }

    function drawAurora(t: number) {
      const g = ctx!.createRadialGradient(w * 0.5, h * 0.45, 0, w * 0.5, h * 0.5, w * 0.55);
      g.addColorStop(0, `rgba(16, 185, 129, ${0.12 + Math.sin(t * 0.8) * 0.04})`);
      g.addColorStop(0.45, `rgba(99, 102, 241, ${0.08 + Math.cos(t * 0.6) * 0.03})`);
      g.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx!.fillStyle = g;
      ctx!.fillRect(0, 0, w, h);
    }

    function drawRoutes(t: number) {
      routes.forEach((route, idx) => {
        const steps = 80;
        ctx!.beginPath();
        for (let i = 0; i <= steps; i++) {
          const pt = bezierPoint(i / steps, route.p0, route.p1, route.p2, route.p3);
          if (i === 0) ctx!.moveTo(pt.x, pt.y);
          else ctx!.lineTo(pt.x, pt.y);
        }
        const grad = ctx!.createLinearGradient(route.p0.x, route.p0.y, route.p3.x, route.p3.y);
        grad.addColorStop(0, "rgba(52, 211, 153, 0)");
        grad.addColorStop(0.5, `rgba(52, 211, 153, ${0.35 + Math.sin(t + idx) * 0.1})`);
        grad.addColorStop(1, "rgba(129, 140, 248, 0.15)");
        ctx!.strokeStyle = grad;
        ctx!.lineWidth = 1.2;
        ctx!.shadowBlur = 12;
        ctx!.shadowColor = "rgba(52, 211, 153, 0.4)";
        ctx!.stroke();
        ctx!.shadowBlur = 0;
      });
    }

    function drawRouteDots() {
      routeDots.forEach((dot) => {
        dot.t = (dot.t + dot.speed) % 1;
        const route = routes[dot.route];
        if (!route) return;
        const pt = bezierPoint(dot.t, route.p0, route.p1, route.p2, route.p3);
        const r = 2.5 + Math.sin(dot.glow * 10) * 0.8;
        const g = ctx!.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, r * 4);
        g.addColorStop(0, "rgba(167, 243, 208, 0.95)");
        g.addColorStop(0.4, "rgba(52, 211, 153, 0.5)");
        g.addColorStop(1, "rgba(52, 211, 153, 0)");
        ctx!.fillStyle = g;
        ctx!.beginPath();
        ctx!.arc(pt.x, pt.y, r * 4, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.fillStyle = "#ecfdf5";
        ctx!.beginPath();
        ctx!.arc(pt.x, pt.y, r * 0.6, 0, Math.PI * 2);
        ctx!.fill();
      });
    }

    function drawHubs(t: number) {
      hubs.forEach((hub) => {
        const pulse = (Math.sin(t * 2 + hub.pulse) + 1) * 0.5;
        const rings = 3;
        for (let i = 0; i < rings; i++) {
          const ringR = hub.radius + i * 18 + pulse * 12;
          const alpha = (0.25 - i * 0.07) * (1 - pulse * 0.3);
          ctx!.beginPath();
          ctx!.arc(hub.x, hub.y, ringR, 0, Math.PI * 2);
          ctx!.strokeStyle = `rgba(52, 211, 153, ${alpha})`;
          ctx!.lineWidth = 1;
          ctx!.stroke();
        }
        const core = ctx!.createRadialGradient(hub.x, hub.y, 0, hub.x, hub.y, hub.radius * 0.5);
        core.addColorStop(0, "rgba(167, 243, 208, 0.9)");
        core.addColorStop(0.5, "rgba(16, 185, 129, 0.45)");
        core.addColorStop(1, "rgba(16, 185, 129, 0)");
        ctx!.fillStyle = core;
        ctx!.beginPath();
        ctx!.arc(hub.x, hub.y, hub.radius * 0.5, 0, Math.PI * 2);
        ctx!.fill();
      });
    }

    function drawParticles(t: number) {
      const mx = mouseRef.current.active ? mouseRef.current.x * w : w * 0.5;
      const my = mouseRef.current.active ? mouseRef.current.y * h : h * 0.5;

      particles.forEach((p, i) => {
        const angle = noise2(p.x, p.y, t) * Math.PI * 2;
        const speed = 0.35 + noise2(p.y, p.x, t + 10) * 0.25;
        p.vx += Math.cos(angle) * speed * 0.08;
        p.vy += Math.sin(angle) * speed * 0.08;

        if (mouseRef.current.active) {
          const dx = mx - p.x;
          const dy = my - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          if (dist < 140) {
            p.vx += (dx / dist) * 0.06;
            p.vy += (dy / dist) * 0.06;
          }
        }

        p.vx *= 0.92;
        p.vy *= 0.92;
        p.x += p.vx;
        p.y += p.vy;
        p.life += 0.004;

        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        const flicker = 0.5 + Math.sin(p.life * 8 + i) * 0.5;
        ctx!.fillStyle = `hsla(${p.hue}, 85%, 65%, ${0.15 + flicker * 0.35})`;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx!.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 90) {
            const alpha = (1 - dist / 90) * 0.12;
            ctx!.beginPath();
            ctx!.moveTo(p.x, p.y);
            ctx!.lineTo(p2.x, p2.y);
            ctx!.strokeStyle = `rgba(129, 140, 248, ${alpha})`;
            ctx!.lineWidth = 0.6;
            ctx!.stroke();
          }
        }
      });
    }

    function drawScanLine(t: number) {
      const y = ((t * 40) % (h + 80)) - 40;
      const grad = ctx!.createLinearGradient(0, y - 30, 0, y + 30);
      grad.addColorStop(0, "rgba(52, 211, 153, 0)");
      grad.addColorStop(0.5, "rgba(52, 211, 153, 0.06)");
      grad.addColorStop(1, "rgba(52, 211, 153, 0)");
      ctx!.fillStyle = grad;
      ctx!.fillRect(0, y - 30, w, 60);
    }

    function draw(t: number) {
      ctx!.clearRect(0, 0, w, h);
      drawAurora(t);
      drawRoutes(t);
      drawParticles(t);
      drawRouteDots();
      drawHubs(t);
      drawScanLine(t);
      animId = requestAnimationFrame(() => draw(performance.now() * 0.001));
    }

    resize();
    draw(0);

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, [useStaticFallback]);

  if (useStaticFallback) {
    return (
      <div
        className={cn(
          "relative h-full w-full overflow-hidden bg-gradient-to-br from-emerald-950/80 via-slate-950 to-indigo-950/60",
          className,
        )}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(52,211,153,0.25),transparent_55%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_70%,rgba(99,102,241,0.15),transparent_50%)]" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/15 blur-[60px]" />
      </div>
    );
  }

  return (
    <div
      className={cn("relative h-full w-full overflow-hidden", className)}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {/* Glass HUD overlays — hidden on small phones to reduce clutter */}
      <div className="pointer-events-none absolute inset-0 hidden sm:block">
        <div className="absolute left-[8%] top-[18%] rounded-xl border border-white/10 bg-white/5 px-3 py-2 backdrop-blur-md">
          <p className="text-[10px] font-medium uppercase tracking-widest text-emerald-300/80">Live Fleet</p>
          <p className="text-lg font-bold tabular-nums text-white">847<span className="text-sm text-emerald-400"> km/h</span></p>
        </div>
        <div className="absolute right-[10%] top-[28%] rounded-xl border border-white/10 bg-white/5 px-3 py-2 backdrop-blur-md">
          <p className="text-[10px] font-medium uppercase tracking-widest text-indigo-300/80">Orders/sec</p>
          <p className="text-lg font-bold tabular-nums text-white">2.4k</p>
        </div>
        <div className="absolute bottom-[22%] left-[12%] flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1.5 backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <span className="text-xs font-medium text-emerald-200">Geo-routing active</span>
        </div>
      </div>

      {/* Center glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/20 blur-[80px]" />
    </div>
  );
}
