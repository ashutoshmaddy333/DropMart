"use client";

import { useEffect, useState } from "react";
import { useAppSelector } from "@/store/hooks";
import { apiFetch } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Supplier {
  id: string;
  businessName: string;
  warehouseCity: string;
  status: string;
  statusLabel: string;
  user: { name: string; email: string; phone: string | null };
  createdAt: string;
}

export default function AdminSuppliersPage() {
  const { token } = useAppSelector((s) => s.auth);
  const [pending, setPending] = useState<Supplier[]>([]);
  const [all, setAll] = useState<Supplier[]>([]);

  async function load() {
    if (!token) return;
    const [p, a] = await Promise.all([
      apiFetch<Supplier[]>("/suppliers/pending", { token }),
      apiFetch<Supplier[]>("/suppliers", { token }),
    ]);
    setPending(p);
    setAll(a);
  }

  useEffect(() => { load().catch(console.error); }, [token]);

  async function verify(id: string, action: "verify" | "reject") {
    if (!token) return;
    await apiFetch(`/suppliers/${id}/verify`, {
      method: "PATCH",
      token,
      body: JSON.stringify({ action }),
    });
    toast.success(action === "verify" ? "Supplier verified!" : "Supplier rejected");
    load();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Supplier Verification</h1>
        <p className="text-muted-foreground">Approve or reject supplier registrations</p>
      </div>

      {pending.length > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-6">
          <h2 className="mb-4 font-semibold">Pending Verification ({pending.length})</h2>
          <div className="space-y-3">
            {pending.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-lg border bg-card p-4">
                <div>
                  <p className="font-medium">{s.businessName}</p>
                  <p className="text-sm text-muted-foreground">{s.user.name} · {s.user.email} · {s.warehouseCity}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => verify(s.id, "verify")}>Verify</Button>
                  <Button size="sm" variant="destructive" onClick={() => verify(s.id, "reject")}>Reject</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border">
        <div className="border-b px-5 py-3 font-semibold">All Suppliers</div>
        <div className="divide-y">
          {all.map((s) => (
            <div key={s.id} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="font-medium">{s.businessName}</p>
                <p className="text-sm text-muted-foreground">{s.user.email}</p>
              </div>
              <Badge>{s.statusLabel}</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
