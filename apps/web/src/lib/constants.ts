export const SITE_NAME = "DropMart";
export const SITE_TAGLINE = "India's Smart Dropshipping Marketplace";
export const SITE_URL = "https://dropmart.in";

export const CONTACT = {
  phone: "7355552418",
  phoneDisplay: "+91 73555 52418",
  email: "rainishu794@gmail.com",
  whatsapp: "917355552418",
  instagram: "",
} as const;

export const NAV_LINKS = [
  { name: "All Products", href: "/products" },
  { name: "Categories", href: "/categories" },
  { name: "Contact Us", href: "/contact" },
  { name: "About Us", href: "/about" },
  { name: "Help Center", href: "/help" },
] as const;

export const NAV_CATEGORIES = [
  { name: "Home Decor", slug: "home-decor", image: "/images/categories/home-decor.jpg" },
  { name: "Kitchen", slug: "kitchen", image: "/images/categories/kitchen.jpg" },
  { name: "Fitness", slug: "fitness", image: "/images/categories/fitness.jpg" },
  { name: "Electronics", slug: "electronics", image: "/images/categories/electronics.jpg" },
  { name: "Fashion", slug: "fashion", image: "/images/categories/fashion.jpg" },
  { name: "Beauty", slug: "beauty", image: "/images/categories/beauty.jpg" },
] as const;

export const TRUST_BADGES = [
  { icon: "truck" as const, title: "Fast Delivery", desc: "2-5 days from nearby warehouse" },
  { icon: "shield-check" as const, title: "Secure Payments", desc: "Razorpay & Stripe protected" },
  { icon: "returns" as const, title: "Easy Returns", desc: "7-day hassle-free returns" },
  { icon: "bolt" as const, title: "Flash Deals", desc: "Limited-time exclusive offers" },
] as const;

import type { Permission } from "@/modules/rbac/permissions";

export const ADMIN_NAV: {
  label: string;
  href: string;
  icon: "chart-bar" | "shopping-cart" | "cube" | "users" | "lock" | "settings" | "bell" | "truck";
  permission: Permission | null;
}[] = [
  { label: "Dashboard", href: "/admin", icon: "chart-bar", permission: null },
  { label: "Orders", href: "/admin/orders", icon: "shopping-cart", permission: "order:read" as Permission },
  { label: "Live Delivery", href: "/admin/delivery", icon: "truck", permission: "order:process" as Permission },
  { label: "Products", href: "/admin/products", icon: "cube", permission: "product:read" as Permission },
  { label: "Suppliers", href: "/admin/suppliers", icon: "users", permission: "supplier:verify" as Permission },
  { label: "Notifications", href: "/admin/notifications", icon: "bell", permission: null },
  { label: "Users", href: "/admin/users", icon: "users", permission: "user:manage" as Permission },
  { label: "RBAC", href: "/admin/rbac", icon: "lock", permission: "rbac:manage" as Permission },
  { label: "Settings", href: "/admin/settings", icon: "settings", permission: "platform:config" as Permission },
];

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const CITIES = [
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Pune",
  "Kolkata",
] as const;
