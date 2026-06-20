"use client";

import { useEffect, useMemo, useState } from "react";
import { ProductCard } from "@/components/storefront/product/product-card";
import { ScrollReveal } from "@/modules/storefront-ui/animations/scroll-reveal";
import { apiFetch } from "@/lib/api/client";
import { toStorefrontProduct, type ApiProduct } from "@/lib/api/products";
import type { Product } from "@/modules/products/types";
import { NAV_CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface ProductsListingProps {
  initialQuery?: string;
  initialDeals?: boolean;
  initialCategory?: string;
}

export function ProductsListing({
  initialQuery,
  initialDeals,
  initialCategory,
}: ProductsListingProps) {
  const [category, setCategory] = useState(initialCategory ?? "all");
  const [sort, setSort] = useState<"price-asc" | "price-desc" | "rating" | "newest">("newest");
  const [priceRange, setPriceRange] = useState<"all" | "under-1000" | "1000-3000" | "above-3000">("all");
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const search = new URLSearchParams();
    if (initialQuery) search.set("q", initialQuery);
    if (initialDeals) search.set("flashDeals", "true");
    const qs = search.toString();

    setLoading(true);
    apiFetch<ApiProduct[]>(`/products${qs ? `?${qs}` : ""}`)
      .then((data) => setAllProducts(data.map(toStorefrontProduct)))
      .catch(() => setAllProducts([]))
      .finally(() => setLoading(false));
  }, [initialQuery, initialDeals]);

  const products = useMemo(() => {
    let result = [...allProducts];

    if (category !== "all") {
      result = result.filter((p) => p.categorySlug === category);
    }

    if (priceRange === "under-1000") result = result.filter((p) => p.price < 1000);
    else if (priceRange === "1000-3000") result = result.filter((p) => p.price >= 1000 && p.price <= 3000);
    else if (priceRange === "above-3000") result = result.filter((p) => p.price > 3000);

    result.sort((a, b) => {
      if (sort === "price-asc") return a.price - b.price;
      if (sort === "price-desc") return b.price - a.price;
      if (sort === "rating") return b.rating - a.rating;
      return 0;
    });

    return result;
  }, [allProducts, category, sort, priceRange]);

  const title = initialDeals
    ? "⚡ Flash Deals"
    : initialQuery
      ? `Results for "${initialQuery}"`
      : "All Products";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <ScrollReveal>
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="mt-1 text-muted-foreground">
            {loading ? "Loading..." : `${products.length} product${products.length !== 1 ? "s" : ""} found`}
          </p>
        </div>
      </ScrollReveal>

      <div className="grid gap-8 lg:grid-cols-4">
        <aside className="space-y-6 lg:col-span-1">
          <div className="rounded-xl border bg-card p-4">
            <h3 className="mb-3 font-semibold">Categories</h3>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setCategory("all")}
                className={cn(
                  "w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                  category === "all" ? "bg-brand text-brand-foreground" : "hover:bg-muted"
                )}
              >
                All ({allProducts.length})
              </button>
              {NAV_CATEGORIES.map((cat) => {
                const count = allProducts.filter((p) => p.categorySlug === cat.slug).length;
                return (
                  <button
                    key={cat.slug}
                    type="button"
                    onClick={() => setCategory(cat.slug)}
                    className={cn(
                      "w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                      category === cat.slug ? "bg-brand text-brand-foreground" : "hover:bg-muted"
                    )}
                  >
                    {cat.name} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border bg-card p-4">
            <h3 className="mb-3 font-semibold">Price Range</h3>
            <div className="space-y-1">
              {(
                [
                  ["all", "All Prices"],
                  ["under-1000", "Under ₹999"],
                  ["1000-3000", "₹1,000 – ₹3,000"],
                  ["above-3000", "Above ₹3,000"],
                ] as const
              ).map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setPriceRange(val)}
                  className={cn(
                    "w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                    priceRange === val ? "bg-brand text-brand-foreground" : "hover:bg-muted"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border bg-card p-4">
            <h3 className="mb-3 font-semibold">Sort By</h3>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            >
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </aside>

        <div className="lg:col-span-3">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-lg font-medium">No products found</p>
              <p className="mt-1 text-muted-foreground">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((product, i) => (
                <ProductCard key={product.id} product={product} priority={i < 3} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
