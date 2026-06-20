"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/shared/icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ApiOrder, OrderTimelineStep } from "@/lib/api/types";
import { formatDate } from "@/lib/format";

const WAITING_STYLES: Record<string, string> = {
  supplier_pack: "bg-amber-500/10 text-amber-700 border-amber-500/30",
  admin_assign_rider: "bg-indigo-500/10 text-indigo-700 border-indigo-500/30",
  delivery_partner: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30",
};

const WAITING_ICON: Record<string, "cube" | "users" | "truck"> = {
  supplier_pack: "cube",
  admin_assign_rider: "users",
  delivery_partner: "truck",
};

interface OrderTrackingPanelProps {
  order: Pick<
    ApiOrder,
    | "id"
    | "orderNumber"
    | "status"
    | "statusLabel"
    | "statusColor"
    | "timeline"
    | "waitingFor"
    | "waitingLabel"
    | "canTrackLive"
    | "total"
    | "paymentMethodLabel"
    | "createdAt"
  >;
  role?: "customer" | "supplier" | "admin";
  onMarkPacked?: () => void;
  packing?: boolean;
  showTrackLink?: boolean;
}

function StepIcon({ state }: { state: OrderTimelineStep["state"] }) {
  if (state === "done") {
    return (
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
        <svg viewBox="0 0 16 16" className="h-4 w-4 fill-current">
          <path d="M6.5 11.5L3 8l1-1 2.5 2.5L12 4l1 1z" />
        </svg>
      </span>
    );
  }
  if (state === "active") {
    return (
      <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-brand-foreground">
        <span className="absolute inset-0 animate-ping rounded-full bg-brand/40" />
        <span className="relative h-2.5 w-2.5 rounded-full bg-white" />
      </span>
    );
  }
  return <span className="h-8 w-8 shrink-0 rounded-full border-2 border-muted bg-muted/30" />;
}

export function OrderTrackingPanel({
  order,
  role = "customer",
  onMarkPacked,
  packing,
  showTrackLink = true,
}: OrderTrackingPanelProps) {
  const steps = order.timeline ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-sm font-semibold text-brand">{order.orderNumber}</p>
          <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
        </div>
        <Badge
          variant="outline"
          style={order.statusColor ? { borderColor: order.statusColor, color: order.statusColor } : undefined}
        >
          {order.statusLabel}
        </Badge>
      </div>

      {order.waitingFor && order.waitingLabel && (
        <div
          className={cn(
            "flex items-start gap-3 rounded-xl border p-4",
            WAITING_STYLES[order.waitingFor] ?? "bg-muted/50",
          )}
        >
          <Icon name={WAITING_ICON[order.waitingFor] ?? "bolt"} size={20} />
          <div className="flex-1">
            <p className="text-sm font-semibold">Waiting</p>
            <p className="text-sm opacity-90">{order.waitingLabel}</p>
            {role === "supplier" && order.waitingFor === "supplier_pack" && onMarkPacked && (
              <Button size="sm" className="mt-3" onClick={onMarkPacked} disabled={packing}>
                {packing ? "Updating..." : "Mark as Packed"}
              </Button>
            )}
            {role === "admin" && order.waitingFor === "admin_assign_rider" && (
              <Button size="sm" className="mt-3" asChild>
                <Link href="/admin/delivery">Assign Delivery Partner</Link>
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="rounded-xl border bg-card p-5">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Live Status
        </h3>
        <div className="space-y-0">
          {steps.map((step, i) => (
            <div key={step.code} className="flex gap-4">
              <div className="flex flex-col items-center">
                <StepIcon state={step.state} />
                {i < steps.length - 1 && (
                  <div
                    className={cn(
                      "my-1 w-0.5 flex-1 min-h-[28px]",
                      step.state === "done" ? "bg-emerald-400" : "bg-muted",
                    )}
                  />
                )}
              </div>
              <div className={cn("pb-6", i === steps.length - 1 && "pb-0")}>
                <p
                  className={cn(
                    "font-medium",
                    step.state === "active" && "text-brand",
                    step.state === "pending" && "text-muted-foreground",
                  )}
                >
                  {step.label}
                </p>
                <p className="text-sm text-muted-foreground">{step.description}</p>
                {step.at && step.state !== "pending" && (
                  <p className="mt-0.5 text-xs text-muted-foreground">{formatDate(step.at)}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showTrackLink && order.canTrackLive && (
        <Button className="w-full" asChild>
          <Link href={`/track/${order.id}`}>
            <Icon name="truck" size={16} className="mr-2 invert" />
            Track Live on Map
          </Link>
        </Button>
      )}
    </div>
  );
}
