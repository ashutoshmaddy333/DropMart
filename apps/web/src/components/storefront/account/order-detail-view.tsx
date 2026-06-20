"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchOrderById } from "@/store/slices/ordersSlice";
import { OrderTrackingPanel } from "@/components/orders/order-tracking-panel";
import { LiveTrackingMap } from "@/components/tracking/live-tracking-map";
import { Button } from "@/components/ui/button";
import { getRealtimeUrl } from "@/lib/api/api-base-url";
import { formatCurrency } from "@/lib/format";

export function OrderDetailView({ orderId }: { orderId: string }) {
  const dispatch = useAppDispatch();
  const order = useAppSelector((s) => s.orders.current);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    dispatch(fetchOrderById(orderId));
  }, [dispatch, orderId]);

  useEffect(() => {
    const socket = io(`${getRealtimeUrl()}/tracking`, {
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;
    socket.on("connect", () => socket.emit("join_order", orderId));
    socket.on("order_status_update", () => {
      dispatch(fetchOrderById(orderId));
    });
    const poll = setInterval(() => dispatch(fetchOrderById(orderId)), 15000);
    return () => {
      socket.disconnect();
      clearInterval(poll);
    };
  }, [orderId, dispatch]);

  if (!order || order.id !== orderId) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Order Tracking</h1>
          <p className="text-sm text-muted-foreground">Live map · geofence updates · rider notifications</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/account/orders">All Orders</Link>
        </Button>
      </div>

      {order.canTrackLive ? (
        <LiveTrackingMap orderId={order.id} variant="fullscreen" />
      ) : (
        <div className="overflow-hidden rounded-2xl border">
          <div className="flex min-h-[200px] flex-col items-center justify-center bg-muted/30 p-8 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand/10">
              <span className="text-2xl">📦</span>
            </div>
            <p className="font-medium">{order.waitingLabel ?? "Preparing your order"}</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Live Rapido-style map tracking starts once a delivery partner is assigned and starts GPS.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        <OrderTrackingPanel order={order} role="customer" />

        <div className="rounded-xl border p-5">
          <h3 className="mb-3 font-semibold">Order Summary</h3>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.productId} className="flex gap-3">
                <div className="relative h-12 w-12 overflow-hidden rounded-lg border">
                  <Image
                    src={item.image ?? "/images/products/headphones.jpg"}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-medium">{formatCurrency(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between border-t pt-4 font-bold">
            <span>Total {order.paymentMethodLabel ? `· ${order.paymentMethodLabel}` : ""}</span>
            <span>{formatCurrency(order.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
