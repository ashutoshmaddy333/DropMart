import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/storefront/product/product-card";
import { ScrollReveal, StaggerGrid, StaggerItem } from "@/modules/storefront-ui/animations/scroll-reveal";
import { getProductsByCategory } from "@/modules/products/data/mock-products";
import { CATEGORY_META } from "@/modules/products/data/categories";
import { NAV_CATEGORIES, CITIES, SITE_NAME } from "@/lib/constants";

interface Props {
  params: { slug: string };
  searchParams: { city?: string };
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const category = NAV_CATEGORIES.find((c) => c.slug === params.slug);
  if (!category) return { title: "Category Not Found" };
  const city = searchParams.city;
  return {
    title: city ? `${category.name} in ${city}` : category.name,
    description: CATEGORY_META[params.slug]?.description ?? `Shop ${category.name} on ${SITE_NAME}`,
  };
}

export default function CategoryPage({ params, searchParams }: Props) {
  const category = NAV_CATEGORIES.find((c) => c.slug === params.slug);
  if (!category) notFound();

  const products = getProductsByCategory(params.slug);
  const city = searchParams.city;
  const meta = CATEGORY_META[params.slug];

  return (
    <div>
      {/* Category hero */}
      <div className="relative h-48 overflow-hidden bg-slate-900 md:h-56">
        <Image src={category.image} alt={category.name} fill className="object-cover opacity-40" priority />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 to-transparent" />
        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-center px-4">
          <p className="text-sm font-medium text-emerald-400">Category</p>
          <h1 className="text-3xl font-bold text-white md:text-4xl">
            {category.name}
            {city && <span className="text-slate-400"> in {city}</span>}
          </h1>
          <p className="mt-2 max-w-lg text-sm text-slate-300">{meta?.description}</p>
          <p className="mt-1 text-xs text-slate-400">{products.length} products available</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <ScrollReveal>
          <div className="mb-8 flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Deliver to:</span>
            <Link
              href={`/categories/${params.slug}`}
              className={`rounded-full border px-3 py-1 text-sm transition-colors ${!city ? "border-brand bg-brand text-brand-foreground" : "hover:bg-muted"}`}
            >
              All Cities
            </Link>
            {CITIES.map((c) => (
              <Link
                key={c}
                href={`/categories/${params.slug}?city=${c}`}
                className={`rounded-full border px-3 py-1 text-sm transition-colors ${city === c ? "border-brand bg-brand text-brand-foreground" : "hover:bg-muted"}`}
              >
                {c}
              </Link>
            ))}
          </div>
        </ScrollReveal>

        {products.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-muted-foreground">No products in this category yet.</p>
            <Link href="/products" className="mt-4 inline-block text-emerald-600 hover:underline">
              Browse all products →
            </Link>
          </div>
        ) : (
          <StaggerGrid className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <StaggerItem key={product.id}>
                <ProductCard product={product} />
              </StaggerItem>
            ))}
          </StaggerGrid>
        )}
      </div>
    </div>
  );
}

export function generateStaticParams() {
  return NAV_CATEGORIES.map((c) => ({ slug: c.slug }));
}
