"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchMyOrders } from "@/store/slices/ordersSlice";
import { useSession } from "@/modules/auth/session-context";
import { formatCurrency, formatDate } from "@/lib/format";
import { Icon } from "@/components/shared/icon";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-indigo-100 text-indigo-800",
  packed: "bg-violet-100 text-violet-800",
  shipped: "bg-purple-100 text-purple-800",
  out_for_delivery: "bg-purple-100 text-purple-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
};

export function AccountOrdersView() {
  const { user } = useSession();
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((s) => s.orders);

  useEffect(() => {
    if (user) dispatch(fetchMyOrders());
  }, [dispatch, user]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="rounded-xl border border-dashed py-12 text-center text-muted-foreground">
        No orders yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((order) => {
        const activeStep = order.timeline?.find((s) => s.state === "active");
        return (
          <div key={order.id} className="rounded-xl border bg-card p-5 transition-shadow hover:shadow-md">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-mono text-sm font-medium text-emerald-600">{order.orderNumber}</p>
                <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
              </div>
              <Badge variant="outline" className={STATUS_COLORS[order.status] ?? ""}>
                {order.statusLabel ?? order.status}
              </Badge>
            </div>

            {order.waitingLabel && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-800">
                <Icon name="bolt" size={14} />
                {order.waitingLabel}
              </div>
            )}

            {activeStep && (
              <p className="mt-2 text-sm text-muted-foreground">
                Current: <span className="font-medium text-foreground">{activeStep.label}</span>
              </p>
            )}

            <div className="mt-4 flex flex-wrap gap-3">
              {order.items.map((item) => (
                <div key={item.productId} className="flex items-center gap-2">
                  <div className="relative h-12 w-12 overflow-hidden rounded-lg border">
                    <Image
                      src={item.image ?? "/images/products/headphones.jpg"}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between border-t pt-4">
              <span className="font-bold">{formatCurrency(order.total)}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/account/orders/${order.id}`}>Track Order</Link>
                </Button>
                {order.canTrackLive && (
                  <Button size="sm" asChild>
                    <Link href={`/track/${order.id}`}>Live Map</Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
