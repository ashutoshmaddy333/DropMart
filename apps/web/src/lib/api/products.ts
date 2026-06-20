import type { Product } from "@/modules/products/types";

export interface ApiProduct {
  id: string;
  slug: string;
  name: string;
  description: string;
  shortDescription: string;
  brand: string | null;
  price: number;
  mrp: number;
  images: string[];
  rating: number;
  reviewCount: number;
  inStock: boolean;
  stockCount: number;
  features: string[];
  warehouseCity: string;
  deliveryDays: number;
  isFeatured: boolean;
  isFlashDeal: boolean;
  flashDealEndsAt?: string | null;
  tags: string[];
  category: string;
  categorySlug: string;
  supplierName?: string;
  status?: string;
  statusLabel?: string;
  statusColor?: string | null;
  rejectionNote?: string | null;
  supplierContact?: string;
  supplierEmail?: string;
  createdAt?: string;
  variants?: { id: string; label: string; value: string; inStock: boolean }[];
}

export function toStorefrontProduct(api: ApiProduct): Product {
  return {
    id: api.id,
    slug: api.slug,
    name: api.name,
    description: api.description,
    shortDescription: api.shortDescription,
    category: api.category,
    categorySlug: api.categorySlug,
    brand: api.brand ?? "",
    price: api.price,
    mrp: api.mrp,
    images: api.images.length ? api.images : ["/images/products/headphones.jpg"],
    rating: api.rating,
    reviewCount: api.reviewCount,
    inStock: api.inStock,
    stockCount: api.stockCount,
    variants: api.variants ?? [],
    features: api.features ?? [],
    specifications: {},
    warehouseCity: api.warehouseCity,
    deliveryDays: api.deliveryDays,
    isFeatured: api.isFeatured,
    isFlashDeal: api.isFlashDeal,
    flashDealEndsAt: api.flashDealEndsAt ?? undefined,
    supplierName: api.supplierName ?? "",
    tags: api.tags ?? [],
    reviews: [],
  };
}

function getServerApiBase() {
  const proxy = process.env.API_PROXY_URL ?? "http://localhost:4000";
  return `${proxy}/api/v1`;
}

export async function fetchProductsServer(params?: {
  q?: string;
  category?: string;
  flashDeals?: boolean;
  featured?: boolean;
}): Promise<Product[]> {
  const search = new URLSearchParams();
  if (params?.q) search.set("q", params.q);
  if (params?.category) search.set("category", params.category);
  if (params?.flashDeals) search.set("flashDeals", "true");
  if (params?.featured) search.set("featured", "true");
  const qs = search.toString();

  try {
    const res = await fetch(`${getServerApiBase()}/products${qs ? `?${qs}` : ""}`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as ApiProduct[];
    return data.map(toStorefrontProduct);
  } catch {
    return [];
  }
}

export async function fetchProductBySlugServer(slug: string): Promise<Product | null> {
  try {
    const res = await fetch(`${getServerApiBase()}/products/${slug}`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as ApiProduct;
    return toStorefrontProduct(data);
  } catch {
    return null;
  }
}
