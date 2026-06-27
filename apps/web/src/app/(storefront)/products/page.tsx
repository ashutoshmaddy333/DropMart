import type { Metadata } from "next";
import { ProductsListing } from "@/components/storefront/product/products-listing";
import { fetchProductsServer } from "@/lib/api/products";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "All Products",
  description: `Browse all products on ${SITE_NAME}`,
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { q?: string; deals?: string; category?: string };
}) {
  const initialProducts = await fetchProductsServer({
    q: searchParams.q,
    flashDeals: searchParams.deals === "flash",
    category: searchParams.category,
  });

  return (
    <ProductsListing
      initialProducts={initialProducts}
      initialQuery={searchParams.q}
      initialDeals={searchParams.deals === "flash"}
      initialCategory={searchParams.category}
    />
  );
}
