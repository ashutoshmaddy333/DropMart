"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icon } from "@/components/shared/icon";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { registerSupplier } from "@/store/slices/authSlice";
import { SITE_NAME, CITIES } from "@/lib/constants";
import { EmailOtpField } from "@/components/auth/email-otp-field";
import { toast } from "sonner";

export function RegisterSupplierForm() {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((s) => s.auth);
  const router = useRouter();
  const [form, setForm] = useState({
    name: "", email: "", password: "", phone: "", otp: "",
    businessName: "", warehouseCity: "Mumbai", gstNumber: "", address: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.otp || form.otp.length !== 6) {
      toast.error("Enter the 6-digit verification code from your email");
      return;
    }
    const result = await dispatch(registerSupplier(form));
    if (registerSupplier.fulfilled.match(result)) {
      toast.success("Supplier registration submitted! Awaiting admin verification.");
      router.push("/supplier/pending");
    } else {
      toast.error((result.payload as string) ?? "Registration failed");
    }
  }

  return (
    <div className="mx-auto w-full max-w-lg px-1 sm:px-0">
      <div className="mb-8 text-center">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand shadow-glow">
            <Icon name="shopping-bag-solid" size={20} className="invert" />
          </div>
          <span className="text-2xl font-bold">{SITE_NAME}</span>
        </Link>
        <h1 className="mt-6 text-2xl font-bold">Become a Supplier</h1>
        <p className="mt-1 text-sm text-muted-foreground">Sell your products after admin verification</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border bg-card p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Your Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label>Business Name</Label>
            <Input value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} required />
          </div>
        </div>
        <EmailOtpField
          email={form.email}
          otp={form.otp}
          onEmailChange={(email) => setForm({ ...form, email })}
          onOtpChange={(otp) => setForm({ ...form, otp })}
          disabled={loading}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Warehouse City</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={form.warehouseCity}
              onChange={(e) => setForm({ ...form, warehouseCity: e.target.value })}
            >
              {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div className="space-y-2">
          <Label>GST Number (optional)</Label>
          <Input value={form.gstNumber} onChange={(e) => setForm({ ...form, gstNumber: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Business Address</Label>
          <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>Password</Label>
          <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} minLength={6} required />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Submitting..." : "Register as Supplier"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already registered? <Link href="/login" className="font-medium text-brand hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
