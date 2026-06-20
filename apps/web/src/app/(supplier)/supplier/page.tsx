"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { apiFetch } from "@/lib/api/client";
import { fetchSupplierProducts } from "@/store/slices/productsSlice";
import { fetchSupplierOrders } from "@/store/slices/ordersSlice";
import { formatCurrency } from "@/lib/format";
import { Button } from "@/components/ui/button";

interface DashboardData {
  stats: { totalProducts: number; totalOrders: number; pendingApproval: number };
  recentOrders: { id: string; orderNumber: string; customerName: string; total: number; statusLabel: string; createdAt: string }[];
}

export default function SupplierDashboardPage() {
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((s) => s.auth);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);

  useEffect(() => {
    dispatch(fetchSupplierProducts());
    dispatch(fetchSupplierOrders());
    if (token) {
      apiFetch<DashboardData>("/suppliers/me/dashboard", { token }).then(setDashboard).catch(console.error);
    }
  }, [dispatch, token]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Supplier Dashboard</h1>
        <p className="text-muted-foreground">Manage your products and orders</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Products", value: dashboard?.stats.totalProducts ?? 0 },
          { label: "Total Orders", value: dashboard?.stats.totalOrders ?? 0 },
          { label: "Pending Approval", value: dashboard?.stats.pendingApproval ?? 0 },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border bg-card p-5">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="mt-1 text-3xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <Button asChild><Link href="/supplier/products/new">Add New Product</Link></Button>
        <Button variant="outline" asChild><Link href="/supplier/products">View Products</Link></Button>
      </div>

      <div className="rounded-xl border">
        <div className="border-b px-5 py-3 font-semibold">Recent Orders</div>
        <div className="divide-y">
          {dashboard?.recentOrders.length ? dashboard.recentOrders.map((o) => (
            <div key={o.id} className="flex items-center justify-between px-5 py-3 text-sm">
              <div>
                <p className="font-medium">{o.orderNumber}</p>
                <p className="text-muted-foreground">{o.customerName}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">{formatCurrency(o.total)}</p>
                <p className="text-xs text-muted-foreground">{o.statusLabel}</p>
              </div>
            </div>
          )) : (
            <p className="px-5 py-8 text-center text-muted-foreground">No orders yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
