"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icon } from "@/components/shared/icon";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { registerCustomer } from "@/store/slices/authSlice";
import { SITE_NAME } from "@/lib/constants";
import { EmailOtpField } from "@/components/auth/email-otp-field";
import { toast } from "sonner";

export function RegisterCustomerForm() {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((s) => s.auth);
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", otp: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.otp || form.otp.length !== 6) {
      toast.error("Enter the 6-digit verification code from your email");
      return;
    }
    const result = await dispatch(registerCustomer(form));
    if (registerCustomer.fulfilled.match(result)) {
      toast.success("Account created!");
      router.push("/");
    } else {
      toast.error((result.payload as string) ?? "Registration failed");
    }
  }

  return (
    <div className="mx-auto w-full max-w-md px-1 sm:px-0">
      <div className="mb-8 text-center">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand shadow-glow">
            <Icon name="shopping-bag-solid" size={20} className="invert" />
          </div>
          <span className="text-2xl font-bold">{SITE_NAME}</span>
        </Link>
        <h1 className="mt-6 text-2xl font-bold">Create Account</h1>
        <p className="mt-1 text-sm text-muted-foreground">Shop from verified suppliers</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border bg-card p-6 shadow-sm">
        <div className="space-y-2">
          <Label>Full Name</Label>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <EmailOtpField
          email={form.email}
          otp={form.otp}
          onEmailChange={(email) => setForm({ ...form, email })}
          onOtpChange={(otp) => setForm({ ...form, otp })}
          disabled={loading}
        />
        <div className="space-y-2">
          <Label>Phone</Label>
          <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" />
        </div>
        <div className="space-y-2">
          <Label>Password</Label>
          <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} minLength={6} required />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating..." : "Create Account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-brand hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
