import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getAllCategories } from "@/modules/products/data/categories";
import { ScrollReveal, StaggerGrid, StaggerItem } from "@/modules/storefront-ui/animations/scroll-reveal";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "All Categories",
  description: `Browse all product categories on ${SITE_NAME}`,
};

export default function CategoriesPage() {
  const categories = getAllCategories();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <ScrollReveal>
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight">Shop by Category</h1>
          <p className="mt-2 text-muted-foreground">
            Explore {categories.length} categories with geo-boosted fast delivery
          </p>
        </div>
      </ScrollReveal>

      <StaggerGrid className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <StaggerItem key={cat.slug}>
            <Link
              href={`/categories/${cat.slug}`}
              className="group block overflow-hidden rounded-2xl border bg-card transition-shadow hover:shadow-xl"
            >
              <div className="relative aspect-[16/9] overflow-hidden">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-0 p-5">
                  <h2 className="text-xl font-bold text-white">{cat.name}</h2>
                  <p className="mt-1 text-sm text-white/70">{cat.productCount} products</p>
                </div>
              </div>
              <div className="p-4">
                <p className="line-clamp-2 text-sm text-muted-foreground">{cat.description}</p>
                <span className="mt-2 inline-block text-sm font-medium text-emerald-600 group-hover:underline">
                  Shop now →
                </span>
              </div>
            </Link>
          </StaggerItem>
        ))}
      </StaggerGrid>
    </div>
  );
}
