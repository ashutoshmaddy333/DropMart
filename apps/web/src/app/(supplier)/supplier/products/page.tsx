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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Products</h1>
        <Button asChild><Link href="/supplier/products/new">Add Product</Link></Button>
      </div>
      <div className="overflow-hidden rounded-xl border">
        <table className="w-full text-sm">
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
        {!items.length && <p className="py-12 text-center text-muted-foreground">No products yet</p>}
      </div>
    </div>
  );
}
