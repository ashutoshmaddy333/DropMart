"use client";

import { useEffect, useState } from "react";
import { useAppSelector } from "@/store/hooks";
import { apiFetch } from "@/lib/api/client";
import type { ApiOrder, DeliveryBoy } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/format";

export function AdminDeliveryPanel() {
  const { token } = useAppSelector((s) => s.auth);
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [boys, setBoys] = useState<DeliveryBoy[]>([]);
  const [assigning, setAssigning] = useState<string | null>(null);
  const [selectedBoy, setSelectedBoy] = useState<Record<string, string>>({});

  async function load() {
    if (!token) return;
    const [o, b] = await Promise.all([
      apiFetch<ApiOrder[]>("/orders", { token }),
      apiFetch<DeliveryBoy[]>("/delivery/boys", { token }),
    ]);
    setOrders(o);
    setBoys(b);
  }

  useEffect(() => { load().catch(console.error); }, [token]);

  const unassigned = orders.filter(
    (o) => !o.delivery && ["confirmed", "processing", "packed", "shipped"].includes(o.status),
  );

  async function assign(orderId: string) {
    const boyId = selectedBoy[orderId];
    if (!boyId || !token) return;
    setAssigning(orderId);
    try {
      await apiFetch("/delivery/assign", {
        method: "POST",
        token,
        body: JSON.stringify({ orderId, deliveryBoyId: boyId }),
      });
      toast.success("Delivery partner assigned — customer can now track live");
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Assignment failed");
    } finally {
      setAssigning(null);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold">Assign Delivery Partners</h2>
        <p className="text-sm text-muted-foreground">
          Assign a rider to an order. They share GPS from the delivery portal; customers see live map updates.
        </p>
      </div>

      {unassigned.length > 0 ? (
        <div className="space-y-3">
          {unassigned.map((o) => (
            <div key={o.id} className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-mono text-sm font-medium">{o.orderNumber}</p>
                <p className="text-sm text-muted-foreground">
                  {o.customerName} · {formatCurrency(o.total)} · {o.warehouseCity}
                </p>
                {o.address && (
                  <p className="text-xs text-muted-foreground">
                    {o.address.line1}, {o.address.city}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <select
                  className="h-9 rounded-md border bg-background px-3 text-sm"
                  value={selectedBoy[o.id] ?? ""}
                  onChange={(e) => setSelectedBoy((prev) => ({ ...prev, [o.id]: e.target.value }))}
                >
                  <option value="">Select rider</option>
                  {boys.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} {b.isOnline ? "(online)" : ""}
                    </option>
                  ))}
                </select>
                <Button
                  size="sm"
                  disabled={!selectedBoy[o.id] || assigning === o.id}
                  onClick={() => assign(o.id)}
                >
                  {assigning === o.id ? "..." : "Assign"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
          All orders have delivery assignments
        </div>
      )}

      <div className="rounded-xl border">
        <div className="border-b px-5 py-3 font-semibold">Delivery Partners ({boys.length})</div>
        <div className="divide-y">
          {boys.map((b) => (
            <div key={b.id} className="flex items-center justify-between px-5 py-3 text-sm">
              <div>
                <p className="font-medium">{b.name}</p>
                <p className="text-muted-foreground">{b.email} · {b.vehicleNo ?? "No vehicle"}</p>
              </div>
              <Badge variant={b.isOnline ? "default" : "secondary"}>
                {b.isOnline ? "Online" : "Offline"}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
