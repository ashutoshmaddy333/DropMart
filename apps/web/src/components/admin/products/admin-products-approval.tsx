"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useAppSelector } from "@/store/hooks";
import { apiFetch } from "@/lib/api/client";
import type { ApiProduct } from "@/lib/api/products";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/format";

export function AdminProductsApproval() {
  const { token } = useAppSelector((s) => s.auth);
  const [pending, setPending] = useState<ApiProduct[]>([]);
  const [all, setAll] = useState<ApiProduct[]>([]);
  const [rejectNote, setRejectNote] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<string | null>(null);

  async function load() {
    if (!token) return;
    const [p, a] = await Promise.all([
      apiFetch<ApiProduct[]>("/products/admin/pending", { token }),
      apiFetch<ApiProduct[]>("/products/admin/all", { token }),
    ]);
    setPending(p);
    setAll(a);
  }

  useEffect(() => { load().catch(console.error); }, [token]);

  async function handleAction(id: string, action: "approve" | "reject") {
    if (!token) return;
    setLoading(id);
    try {
      await apiFetch(`/products/${id}/approve`, {
        method: "PATCH",
        token,
        body: JSON.stringify({
          action,
          note: action === "reject" ? rejectNote[id] : undefined,
        }),
      });
      toast.success(action === "approve" ? "Product approved — now live on storefront!" : "Product rejected");
      setRejectNote((prev) => ({ ...prev, [id]: "" }));
      await load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-8">
      {pending.length > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-6">
          <h2 className="mb-1 font-semibold">Pending Approval ({pending.length})</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Review supplier submissions. Approved products appear on the storefront immediately.
          </p>
          <div className="space-y-4">
            {pending.map((p) => (
              <div key={p.id} className="rounded-lg border bg-card p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex gap-4">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border">
                      <Image
                        src={p.images[0] ?? "/images/products/headphones.jpg"}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    <div>
                      <p className="font-semibold">{p.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {p.supplierName} · {p.supplierEmail}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {p.category} · {formatCurrency(p.price)} · Stock: {p.stockCount}
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{p.shortDescription}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col gap-2 sm:w-48">
                    <Button
                      size="sm"
                      disabled={loading === p.id}
                      onClick={() => handleAction(p.id, "approve")}
                    >
                      {loading === p.id ? "..." : "Approve"}
                    </Button>
                    <Input
                      placeholder="Rejection reason (optional)"
                      value={rejectNote[p.id] ?? ""}
                      onChange={(e) => setRejectNote((prev) => ({ ...prev, [p.id]: e.target.value }))}
                      className="h-8 text-xs"
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={loading === p.id}
                      onClick={() => handleAction(p.id, "reject")}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {pending.length === 0 && (
        <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
          No products pending approval
        </div>
      )}

      <div className="rounded-xl border">
        <div className="border-b px-5 py-3">
          <h2 className="font-semibold">All Products ({all.length})</h2>
        </div>
        <div className="divide-y">
          {all.map((p) => (
            <div key={p.id} className="flex items-center justify-between gap-4 px-5 py-3">
              <div className="min-w-0">
                <p className="truncate font-medium">{p.name}</p>
                <p className="text-sm text-muted-foreground">
                  {p.supplierName} · {formatCurrency(p.price)}
                </p>
              </div>
              <Badge
                variant={p.status === "approved" ? "default" : p.status === "rejected" ? "destructive" : "secondary"}
              >
                {p.statusLabel ?? p.status}
              </Badge>
            </div>
          ))}
          {!all.length && (
            <p className="px-5 py-8 text-center text-muted-foreground">No products yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
