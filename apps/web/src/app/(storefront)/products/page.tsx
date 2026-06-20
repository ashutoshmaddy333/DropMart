import type { Metadata } from "next";
import { ProductsListing } from "@/components/storefront/product/products-listing";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "All Products",
  description: `Browse all products on ${SITE_NAME}`,
};

export default function ProductsPage({
  searchParams,
}: {
  searchParams: { q?: string; deals?: string; category?: string };
}) {
  return (
    <ProductsListing
      initialQuery={searchParams.q}
      initialDeals={searchParams.deals === "flash"}
      initialCategory={searchParams.category}
    />
  );
}
