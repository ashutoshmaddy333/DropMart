export interface ProductVariant {
  id: string;
  label: string;
  value: string;
  inStock: boolean;
}

export interface ProductReview {
  id: string;
  author: string;
  rating: number;
  title: string;
  body: string;
  date: string;
  verified: boolean;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  shortDescription: string;
  category: string;
  categorySlug: string;
  brand: string;
  price: number;
  mrp: number;
  images: string[];
  rating: number;
  reviewCount: number;
  inStock: boolean;
  stockCount: number;
  variants: ProductVariant[];
  features: string[];
  specifications: Record<string, string>;
  warehouseCity: string;
  deliveryDays: number;
  isFeatured: boolean;
  isFlashDeal: boolean;
  flashDealEndsAt?: string;
  supplierName: string;
  tags: string[];
  reviews: ProductReview[];
}

export interface Category {
  slug: string;
  name: string;
  description: string;
  image: string;
  productCount: number;
}
