"use client";

import { useEffect } from "react";
import { PageTransition } from "@/modules/storefront-ui/animations/page-transition";
import { StorefrontHeader, StorefrontFooter } from "@/components/storefront/layout/storefront-header";
import { useCartStore } from "@/modules/cart/store/cart-store";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    useCartStore.persist.rehydrate();
  }, []);

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden page-mesh">
      <StorefrontHeader />
      <main className="flex-1">
        <PageTransition>{children}</PageTransition>
      </main>
      <StorefrontFooter />
    </div>
  );
}
