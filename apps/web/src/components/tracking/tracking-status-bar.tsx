"use client";

import { cn } from "@/lib/utils";
import { DELIVERY_STATUS_STEPS, statusStepIndex } from "@/lib/tracking/geo";

export function TrackingStatusBar({ status, variant = "light" }: { status: string; variant?: "light" | "dark" }) {
  const activeIdx = statusStepIndex(status);
  const mutedLine = variant === "dark" ? "bg-white/20" : "bg-muted";
  const activeLine = "bg-emerald-500";

  return (
    <div className="flex items-center gap-1">
      {DELIVERY_STATUS_STEPS.map((step, i) => {
        const done = i < activeIdx;
        const active = i === activeIdx;
        return (
          <div key={step.code} className="flex flex-1 flex-col items-center gap-1">
            <div className="flex w-full items-center">
              {i > 0 && (
                <div className={cn("h-0.5 flex-1", done || active ? activeLine : mutedLine)} />
              )}
              <div
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                  done && "bg-emerald-500 text-white",
                  active && "bg-brand text-brand-foreground ring-4 ring-brand/25",
                  !done && !active && (variant === "dark" ? "bg-white/15 text-white/50" : "bg-muted text-muted-foreground"),
                )}
              >
                {done ? "✓" : i + 1}
              </div>
              {i < DELIVERY_STATUS_STEPS.length - 1 && (
                <div className={cn("h-0.5 flex-1", done ? activeLine : mutedLine)} />
              )}
            </div>
            <span
              className={cn(
                "hidden text-[9px] font-medium sm:block",
                active ? "text-brand" : variant === "dark" ? "text-white/50" : "text-muted-foreground",
              )}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
