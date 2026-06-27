import { HomePageView } from "@/components/storefront/home/home-page-view";
import { fetchProductsServer } from "@/lib/api/products";

export default async function HomePage() {
  const [allProducts, featuredProducts, flashDealProducts] = await Promise.all([
    fetchProductsServer(),
    fetchProductsServer({ featured: true }),
    fetchProductsServer({ flashDeals: true }),
  ]);

  return (
    <HomePageView
      initialAllProducts={allProducts}
      initialFeaturedProducts={featuredProducts}
      initialFlashDealProducts={flashDealProducts}
    />
  );
}
