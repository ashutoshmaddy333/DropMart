import type { Metadata } from "next";
import Link from "next/link";
import { AccountProfileView } from "@/components/storefront/account/account-profile-view";
import { ScrollReveal } from "@/modules/storefront-ui/animations/scroll-reveal";

export const metadata: Metadata = { title: "My Profile" };

export default function AccountProfilePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <ScrollReveal>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
            <p className="text-muted-foreground">Manage your account details</p>
          </div>
          <Link href="/account/orders" className="text-sm text-emerald-600 hover:underline">
            My Orders →
          </Link>
        </div>
      </ScrollReveal>
      <AccountProfileView />
    </div>
  );
}
