import type { Metadata } from "next";
import Link from "next/link";
import { AccountOrdersView } from "@/components/storefront/account/account-orders-view";
import { ScrollReveal } from "@/modules/storefront-ui/animations/scroll-reveal";

export const metadata: Metadata = { title: "My Orders" };

export default function AccountOrdersPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <ScrollReveal>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
            <p className="text-muted-foreground">Track and manage your orders</p>
          </div>
          <Link href="/account/profile" className="text-sm text-emerald-600 hover:underline">
            Edit Profile →
          </Link>
        </div>
      </ScrollReveal>
      <AccountOrdersView />
    </div>
  );
}
