"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icon } from "@/components/shared/icon";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { login, clearError } from "@/store/slices/authSlice";
import { getRoleHomePath } from "@/lib/auth/roles";
import { SITE_NAME } from "@/lib/constants";
import { toast } from "sonner";

export function LoginForm() {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((s) => s.auth);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    dispatch(clearError());
    const result = await dispatch(login({ email, password }));
    if (login.fulfilled.match(result)) {
      toast.success(`Welcome back, ${result.payload.user.name}!`);
      const home = redirect ?? getRoleHomePath(result.payload.user.role, result.payload.user.supplier?.status);
      router.replace(home);
    } else {
      toast.error((result.payload as string) ?? "Login failed");
    }
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-8 text-center">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand shadow-glow">
            <Icon name="shopping-bag-solid" size={20} className="invert" />
          </div>
          <span className="text-2xl font-bold">{SITE_NAME}</span>
        </Link>
        <h1 className="mt-6 text-2xl font-bold">Sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">Access your account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border bg-card p-6 shadow-sm">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>

      <div className="mt-6 space-y-2 text-center text-sm text-muted-foreground">
        <p>
          New customer?{" "}
          <Link href="/register" className="font-medium text-brand hover:underline">Create account</Link>
        </p>
        <p>
          Want to sell?{" "}
          <Link href="/register/supplier" className="font-medium text-brand hover:underline">Register as Supplier</Link>
        </p>
      </div>

      <div className="mt-6 rounded-xl border bg-muted/30 p-4 text-xs text-muted-foreground">
        <p className="font-medium text-foreground">Demo accounts (password: password123)</p>
        <p className="mt-1">Customer: arjun@gmail.com · Supplier: meera@supplier.in</p>
        <p>Super Admin: ashutoshkumarm416@gmail.com · Delivery: ravi@delivery.in</p>
      </div>
    </div>
  );
}
