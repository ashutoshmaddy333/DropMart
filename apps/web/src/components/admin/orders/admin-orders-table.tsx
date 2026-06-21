"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Icon } from "@/components/shared/icon";
import { OrderTrackingPanel } from "@/components/orders/order-tracking-panel";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchAllOrders } from "@/store/slices/ordersSlice";
import type { ApiOrder } from "@/lib/api/types";
import { formatCurrency, formatDate, formatRelativeDate } from "@/lib/format";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-indigo-100 text-indigo-800",
  packed: "bg-violet-100 text-violet-800",
  shipped: "bg-purple-100 text-purple-800",
  out_for_delivery: "bg-purple-100 text-purple-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
  refunded: "bg-slate-100 text-slate-700",
};

export function AdminOrdersTable() {
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((s) => s.orders);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<ApiOrder | null>(null);

  useEffect(() => {
    dispatch(fetchAllOrders());
    const interval = setInterval(() => dispatch(fetchAllOrders()), 20000);
    return () => clearInterval(interval);
  }, [dispatch]);

  const filtered = items.filter((o) => {
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    const matchesSearch =
      !search ||
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      (o.customerName ?? "").toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const pendingActions = items.filter(
    (o) => o.waitingFor === "admin_assign_rider" || o.waitingFor === "supplier_pack",
  ).length;

  return (
    <div className="space-y-4">
      {pendingActions > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-800">
          {pendingActions} order{pendingActions !== 1 ? "s" : ""} need attention — supplier packing or rider assignment
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
          <Input
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-[var(--admin-border)] bg-[var(--admin-surface)] pl-9 text-[var(--admin-text)] placeholder:text-[var(--admin-text-muted)]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 w-full rounded-md border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 text-sm text-[var(--admin-text)] sm:w-[180px]"
        >
          <option value="all">All Statuses</option>
          <option value="processing">Processing</option>
          <option value="packed">Packed</option>
          <option value="out_for_delivery">Out for Delivery</option>
          <option value="delivered">Delivered</option>
        </select>
      </div>

      {loading && !items.length ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        </div>
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {filtered.map((order) => (
              <button
                key={order.id}
                type="button"
                onClick={() => setSelectedOrder(order)}
                className="admin-glass w-full rounded-xl p-4 text-left transition-colors active:bg-[var(--admin-surface-hover)]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-mono text-sm font-semibold text-indigo-400">{order.orderNumber}</p>
                    <p className="mt-0.5 truncate text-sm font-medium">{order.customerName}</p>
                    <p className="text-xs text-muted-foreground">{formatRelativeDate(order.createdAt)}</p>
                  </div>
                  <Badge variant="outline" className={cn("shrink-0 capitalize", STATUS_STYLES[order.status])}>
                    {order.statusLabel}
                  </Badge>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{order.supplierName}</span>
                  <span className="font-semibold">{formatCurrency(order.total)}</span>
                </div>
              </button>
            ))}
            {!filtered.length && (
              <p className="py-12 text-center text-muted-foreground">No orders found</p>
            )}
          </div>

          <div className="admin-glass hidden overflow-hidden rounded-xl md:block">
            <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Dependency</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((order) => (
                <TableRow
                  key={order.id}
                  className="admin-table-row cursor-pointer border-[var(--admin-border)]"
                  onClick={() => setSelectedOrder(order)}
                >
                  <TableCell className="font-mono text-sm font-medium">{order.orderNumber}</TableCell>
                  <TableCell>
                    <p className="font-medium">{order.customerName}</p>
                    <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
                  </TableCell>
                  <TableCell className="text-sm">{order.supplierName}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(order.total)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("capitalize", STATUS_STYLES[order.status])}>
                      {order.statusLabel}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[180px] truncate text-xs text-muted-foreground">
                    {order.waitingLabel ?? "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatRelativeDate(order.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOrder(order);
                      }}
                    >
                      Track
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
            </div>
          {!filtered.length && (
            <p className="py-12 text-center text-muted-foreground">No orders found</p>
          )}
        </div>
        </>
      )}

      <OrderDetailSheet order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </div>
  );
}

function OrderDetailSheet({
  order,
  onClose,
}: {
  order: ApiOrder | null;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {order && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="admin-glass admin-gradient-border fixed inset-0 z-50 h-full w-full overflow-y-auto p-4 shadow-2xl sm:inset-auto sm:right-0 sm:top-0 sm:max-w-lg sm:p-6"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-mono text-lg font-bold text-indigo-400">{order.orderNumber}</h2>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--admin-text-muted)] hover:bg-[var(--admin-surface-hover)]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <OrderTrackingPanel order={order} role="admin" showTrackLink={order.canTrackLive} />

              {order.address && (
                <div>
                  <h4 className="mb-2 font-medium">Delivery Address</h4>
                  <p className="text-sm">
                    {order.address.name}
                    <br />
                    {order.address.line1}
                    <br />
                    {order.address.city}, {order.address.state} — {order.address.pincode}
                  </p>
                </div>
              )}

              <div>
                <h4 className="mb-3 font-medium">Items</h4>
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.productId} className="flex gap-3">
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border">
                        <Image
                          src={item.image ?? "/images/products/headphones.jpg"}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="56px"
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
              </div>

              <div className="flex justify-between border-t pt-4 text-base font-bold">
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>

              {order.trackingId && (
                <div className="rounded-lg bg-muted p-3 text-sm">
                  <span className="text-muted-foreground">AWB: </span>
                  <span className="font-mono font-medium">{order.trackingId}</span>
                </div>
              )}

              <div className="flex gap-2">
                {order.waitingFor === "admin_assign_rider" && (
                  <Button className="flex-1 bg-indigo-600 hover:bg-indigo-500" asChild>
                    <Link href="/admin/delivery">Assign Rider</Link>
                  </Button>
                )}
                {order.canTrackLive && (
                  <Button variant="outline" className="flex-1" asChild>
                    <Link href={`/track/${order.id}`}>Live Map</Link>
                  </Button>
                )}
              </div>

              <p className="text-xs text-muted-foreground">Placed {formatDate(order.createdAt)}</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
