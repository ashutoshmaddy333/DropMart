import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/storefront/product/product-card";
import { AdvancedHeroBanner } from "@/modules/storefront-ui/components/advanced-hero";
import {
  AdvancedTrustBadges,
  AdvancedCategoryGrid,
} from "@/modules/storefront-ui/components/advanced-sections";
import { ScrollReveal, StaggerGrid, StaggerItem } from "@/modules/storefront-ui/animations/scroll-reveal";
import { fetchProductsServer } from "@/lib/api/products";
import { NAV_CATEGORIES } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [allProducts, featured, flashDeals] = await Promise.all([
    fetchProductsServer(),
    fetchProductsServer({ featured: true }),
    fetchProductsServer({ flashDeals: true }),
  ]);

  const featuredProducts = featured.length ? featured : allProducts.filter((p) => p.isFeatured).slice(0, 4);
  const flashDealProducts = flashDeals.length ? flashDeals : allProducts.filter((p) => p.isFlashDeal).slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl space-y-20 px-4 py-8">
      <AdvancedHeroBanner />
      <AdvancedTrustBadges />
      <AdvancedCategoryGrid categories={NAV_CATEGORIES} />

      {flashDealProducts.length > 0 && (
        <section className="space-y-6">
          <ScrollReveal>
            <div className="flex items-end justify-between">
              <div>
                <h2 className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-2xl font-bold tracking-tight text-transparent">
                  ⚡ Flash Deals
                </h2>
                <p className="text-muted-foreground">Limited time offers — grab them fast</p>
              </div>
              <Button variant="ghost" asChild>
                <Link href="/products?deals=flash">View All →</Link>
              </Button>
            </div>
          </ScrollReveal>
          <StaggerGrid className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {flashDealProducts.map((product) => (
              <StaggerItem key={product.id}>
                <ProductCard product={product} />
              </StaggerItem>
            ))}
          </StaggerGrid>
        </section>
      )}

      {featuredProducts.length > 0 && (
        <section className="space-y-6">
          <ScrollReveal>
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">Featured Products</h2>
                <p className="text-muted-foreground">Hand-picked bestsellers for you</p>
              </div>
              <Button variant="ghost" asChild>
                <Link href="/products">View All →</Link>
              </Button>
            </div>
          </ScrollReveal>
          <StaggerGrid className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product, i) => (
              <StaggerItem key={product.id}>
                <ProductCard product={product} priority={i < 4} />
              </StaggerItem>
            ))}
          </StaggerGrid>
        </section>
      )}

      <section className="space-y-6">
        <ScrollReveal>
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">All Products</h2>
              <p className="text-muted-foreground">
                {allProducts.length} approved product{allProducts.length !== 1 ? "s" : ""} available
              </p>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/products">View All →</Link>
            </Button>
          </div>
        </ScrollReveal>
        {allProducts.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">
            No products live yet. Suppliers can submit products for admin approval.
          </p>
        ) : (
          <StaggerGrid className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {allProducts.map((product) => (
              <StaggerItem key={product.id}>
                <ProductCard product={product} />
              </StaggerItem>
            ))}
          </StaggerGrid>
        )}
      </section>
    </div>
  );
}
