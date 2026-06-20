"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchSupplierOrders } from "@/store/slices/ordersSlice";
import { apiFetch } from "@/lib/api/client";
import { formatCurrency } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { OrderTrackingPanel } from "@/components/orders/order-tracking-panel";
import { toast } from "sonner";

export default function SupplierOrdersPage() {
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((s) => s.orders);
  const { token } = useAppSelector((s) => s.auth);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [packingId, setPackingId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchSupplierOrders());
  }, [dispatch]);

  async function markPacked(orderId: string) {
    if (!token) return;
    setPackingId(orderId);
    try {
      await apiFetch(`/orders/${orderId}/pack`, { method: "PATCH", token });
      toast.success("Order marked as packed");
      dispatch(fetchSupplierOrders());
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update order");
    } finally {
      setPackingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Order Records</h1>
        <p className="text-sm text-muted-foreground">
          Pack orders when ready — admin assigns delivery after packing
        </p>
      </div>

      <div className="space-y-4">
        {items.map((o) => (
          <div key={o.id} className="overflow-hidden rounded-xl border bg-card">
            <button
              type="button"
              className="flex w-full flex-wrap items-center gap-4 px-4 py-4 text-left hover:bg-muted/30"
              onClick={() => setExpandedId(expandedId === o.id ? null : o.id)}
            >
              <div className="min-w-[120px] font-medium">{o.orderNumber}</div>
              <div className="flex-1 text-sm text-muted-foreground">{o.customerName}</div>
              <div className="font-medium">{formatCurrency(o.total)}</div>
              <Badge style={{ backgroundColor: o.statusColor ?? undefined }}>
                {o.statusLabel}
              </Badge>
              {o.waitingFor === "supplier_pack" && (
                <Badge variant="outline" className="border-amber-500/50 text-amber-700">
                  Action needed
                </Badge>
              )}
              {o.canTrackLive && (
                <Link
                  href={`/track/${o.id}`}
                  className="text-sm text-brand hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  Live Track
                </Link>
              )}
            </button>

            {expandedId === o.id && (
              <div className="border-t p-4">
                <OrderTrackingPanel
                  order={o}
                  role="supplier"
                  onMarkPacked={() => markPacked(o.id)}
                  packing={packingId === o.id}
                  showTrackLink={o.canTrackLive}
                />
              </div>
            )}
          </div>
        ))}
        {!items.length && (
          <p className="py-12 text-center text-muted-foreground">No orders yet</p>
        )}
      </div>
    </div>
  );
}
