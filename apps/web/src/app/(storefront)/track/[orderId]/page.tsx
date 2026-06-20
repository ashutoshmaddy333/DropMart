"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchOrderById } from "@/store/slices/ordersSlice";
import { LiveTrackingMap } from "@/components/tracking/live-tracking-map";
import { OrderTrackingPanel } from "@/components/orders/order-tracking-panel";
import { Button } from "@/components/ui/button";

export default function TrackOrderPage({ params }: { params: { orderId: string } }) {
  const dispatch = useAppDispatch();
  const order = useAppSelector((s) => s.orders.current);
  const { token } = useAppSelector((s) => s.auth);

  useEffect(() => {
    if (token) dispatch(fetchOrderById(params.orderId));
  }, [dispatch, params.orderId, token]);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card px-4 py-3">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">Live Delivery</h1>
            <p className="text-xs text-muted-foreground">
              {order?.orderNumber ?? params.orderId.slice(0, 8)} · Real-time GPS tracking
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href={token ? `/account/orders/${params.orderId}` : "/"}>
              {token ? "Order Details" : "Home"}
            </Link>
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-4xl">
        {order && (
          <div className="border-b px-4 py-4">
            <OrderTrackingPanel order={order} role="customer" showTrackLink={false} />
          </div>
        )}

        <LiveTrackingMap orderId={params.orderId} variant="fullscreen" />
      </div>
    </div>
  );
}
