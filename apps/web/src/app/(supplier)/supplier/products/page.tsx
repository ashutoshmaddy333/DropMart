"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchSupplierProducts } from "@/store/slices/productsSlice";
import { formatCurrency } from "@/lib/format";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function SupplierProductsPage() {
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((s) => s.products);

  useEffect(() => { dispatch(fetchSupplierProducts()); }, [dispatch]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-bold sm:text-2xl">My Products</h1>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/supplier/products/new">Add Product</Link>
        </Button>
      </div>

      <div className="space-y-3 md:hidden">
        {items.map((p) => (
          <div key={p.id} className="rounded-xl border bg-card p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium leading-snug">{p.name}</p>
              <Badge variant={p.status === "approved" ? "default" : p.status === "rejected" ? "destructive" : "secondary"}>
                {p.statusLabel ?? p.status}
              </Badge>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Price</p>
                <p className="font-medium">{formatCurrency(p.price)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Stock</p>
                <p className="font-medium">{p.stockCount}</p>
              </div>
            </div>
            {p.status === "rejected" && p.rejectionNote && (
              <p className="mt-2 text-xs text-muted-foreground">{p.rejectionNote}</p>
            )}
          </div>
        ))}
        {!items.length && <p className="py-12 text-center text-muted-foreground">No products yet</p>}
      </div>

      <div className="hidden overflow-hidden rounded-xl border md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead className="border-b bg-muted/30">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Product</th>
                <th className="px-4 py-3 text-left font-medium">Price</th>
                <th className="px-4 py-3 text-left font-medium">Stock</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3">{formatCurrency(p.price)}</td>
                  <td className="px-4 py-3">{p.stockCount}</td>
                  <td className="px-4 py-3">
                    <div>
                      <Badge variant={p.status === "approved" ? "default" : p.status === "rejected" ? "destructive" : "secondary"}>
                        {p.statusLabel ?? p.status}
                      </Badge>
                      {p.status === "rejected" && p.rejectionNote && (
                        <p className="mt-1 text-xs text-muted-foreground">{p.rejectionNote}</p>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!items.length && <p className="py-12 text-center text-muted-foreground">No products yet</p>}
      </div>
    </div>
  );
}
