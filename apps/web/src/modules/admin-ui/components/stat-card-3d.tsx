"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { AnimatedCounter } from "./animated-counter";

interface StatCard3DProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  change?: string;
  changeType?: "up" | "down" | "neutral";
  icon: React.ReactNode;
  glow?: "indigo" | "emerald" | "amber" | "rose";
  delay?: number;
}

const glowMap = {
  indigo: "admin-glow-indigo",
  emerald: "admin-glow-emerald",
  amber: "shadow-[0_0_40px_rgba(245,158,11,0.2)]",
  rose: "shadow-[0_0_40px_rgba(244,63,94,0.2)]",
};

const iconBgMap = {
  indigo: "bg-indigo-500/20 text-indigo-400",
  emerald: "bg-emerald-500/20 text-emerald-400",
  amber: "bg-amber-500/20 text-amber-400",
  rose: "bg-rose-500/20 text-rose-400",
};

export function StatCard3D({
  label,
  value,
  prefix = "",
  suffix = "",
  change,
  changeType = "neutral",
  icon,
  glow = "indigo",
  delay = 0,
}: StatCard3DProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, rotateX: 8 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      style={{ transformStyle: "preserve-3d", perspective: 1000 }}
      className={cn("admin-glass admin-gradient-border p-5", glowMap[glow])}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--admin-text-muted)]">
            {label}
          </p>
          <p className="admin-stat-value text-3xl font-bold tracking-tight">
            <AnimatedCounter value={value} prefix={prefix} suffix={suffix} />
          </p>
          {change && (
            <p
              className={cn(
                "text-xs font-medium",
                changeType === "up" && "text-emerald-400",
                changeType === "down" && "text-rose-400",
                changeType === "neutral" && "text-[var(--admin-text-muted)]"
              )}
            >
              {changeType === "up" && "↑ "}
              {changeType === "down" && "↓ "}
              {change}
            </p>
          )}
        </div>
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl", iconBgMap[glow])}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
}
