import { NAV_CATEGORIES } from "@/lib/constants";
import { MOCK_PRODUCTS } from "@/modules/products/data/mock-products";

export const CATEGORY_META: Record<
  string,
  { description: string; productCount: number }
> = Object.fromEntries(
  NAV_CATEGORIES.map((cat) => [
    cat.slug,
    {
      description: getCategoryDescription(cat.slug),
      productCount: MOCK_PRODUCTS.filter((p) => p.categorySlug === cat.slug).length,
    },
  ])
);

function getCategoryDescription(slug: string): string {
  const descriptions: Record<string, string> = {
    "home-decor":
      "Transform your space with curated home decor — lamps, bedsheets, wall art and more at dropship prices.",
    kitchen:
      "Everything for your kitchen — air fryers, utensil sets, water bottles and appliances delivered fast.",
    fitness:
      "Gear up for your fitness journey — yoga mats, resistance bands, watches and workout essentials.",
    electronics:
      "Latest gadgets and electronics — headphones, smartwatches, speakers and tech accessories.",
    fashion:
      "Trendy fashion for every occasion — sneakers, casual wear and accessories at unbeatable prices.",
    beauty:
      "Premium skincare and beauty products — serums, moisturizers and self-care essentials.",
  };
  return descriptions[slug] ?? "Browse our curated collection.";
}

export function getAllCategories() {
  return NAV_CATEGORIES.map((cat) => ({
    ...cat,
    ...CATEGORY_META[cat.slug],
  }));
}
