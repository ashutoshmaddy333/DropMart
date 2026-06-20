import type { PrismaClient } from "@prisma/client";

export const CATEGORIES = [
  { slug: "home-decor", name: "Home Decor", description: "Beautiful home decoration items", image: "/images/categories/home-decor.jpg", sortOrder: 1 },
  { slug: "kitchen", name: "Kitchen", description: "Kitchen essentials and appliances", image: "/images/categories/kitchen.jpg", sortOrder: 2 },
  { slug: "fitness", name: "Fitness", description: "Fitness and wellness products", image: "/images/categories/fitness.jpg", sortOrder: 3 },
  { slug: "electronics", name: "Electronics", description: "Gadgets and electronics", image: "/images/categories/electronics.jpg", sortOrder: 4 },
  { slug: "fashion", name: "Fashion", description: "Clothing and accessories", image: "/images/categories/fashion.jpg", sortOrder: 5 },
  { slug: "beauty", name: "Beauty", description: "Beauty and skincare", image: "/images/categories/beauty.jpg", sortOrder: 6 },
];

export const PLATFORM_SETTINGS = [
  { key: "site_name", value: "DropMart", label: "Site Name" },
  { key: "support_email", value: "rainishu794@gmail.com", label: "Support Email" },
  { key: "free_shipping_threshold", value: "999", label: "Free Shipping Threshold (₹)" },
  { key: "default_shipping_fee", value: "49", label: "Default Shipping Fee (₹)" },
  { key: "currency", value: "INR", label: "Currency" },
];

export async function seedCatalog(prisma: PrismaClient) {
  console.log("  → master_categories");
  for (const c of CATEGORIES) {
    await prisma.masterCategory.upsert({ where: { slug: c.slug }, update: c, create: c });
  }
  console.log("  → platform_settings");
  for (const s of PLATFORM_SETTINGS) {
    await prisma.platformSetting.upsert({ where: { key: s.key }, update: s, create: s });
  }
}
