"use client";

import { useAuth } from "@/hooks/use-auth";
import { Icon } from "@/components/shared/icon";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SupplierPendingPage() {
  const { user } = useAuth();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10">
        <Icon name="bell" size={32} />
      </div>
      <h1 className="mt-6 text-2xl font-bold">Verification Pending</h1>
      <p className="mt-2 max-w-md text-muted-foreground">
        Your supplier account <strong>{user?.supplier?.businessName}</strong> is awaiting verification
        by our admin team. You&apos;ll be able to add products once approved.
      </p>
      <p className="mt-4 text-sm text-muted-foreground">
        Status: <span className="font-medium text-amber-600">{user?.supplier?.statusLabel ?? "Pending"}</span>
      </p>
      <Button variant="outline" className="mt-6" asChild>
        <Link href="/contact">Contact Support</Link>
      </Button>
    </div>
  );
}
