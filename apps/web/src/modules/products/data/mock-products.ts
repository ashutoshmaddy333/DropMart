import type { Product } from "../types";

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "prod-001",
    slug: "premium-wireless-headphones",
    name: "Premium Wireless Headphones",
    shortDescription: "Active noise cancellation with 40hr battery life",
    description:
      "Experience studio-quality sound with advanced active noise cancellation. Features Bluetooth 5.3, multipoint connectivity, and plush memory foam ear cushions for all-day comfort. Perfect for work-from-home and travel.",
    category: "Electronics",
    categorySlug: "electronics",
    brand: "SoundMax",
    price: 2499,
    mrp: 4999,
    images: [
      "/images/products/headphones.jpg",
      "/images/products/headphones.jpg",
      "/images/products/headphones.jpg",
    ],
    rating: 4.6,
    reviewCount: 1284,
    inStock: true,
    stockCount: 47,
    variants: [
      { id: "v1", label: "Color", value: "Midnight Black", inStock: true },
      { id: "v2", label: "Color", value: "Silver Frost", inStock: true },
      { id: "v3", label: "Color", value: "Rose Gold", inStock: false },
    ],
    features: [
      "Active Noise Cancellation (ANC)",
      "40-hour battery life",
      "Bluetooth 5.3 with multipoint",
      "Fast charge: 10 min = 5 hours",
      "Foldable design with carry case",
    ],
    specifications: {
      "Driver Size": "40mm dynamic",
      "Frequency Response": "20Hz - 20kHz",
      Weight: "250g",
      Connectivity: "Bluetooth 5.3, 3.5mm jack",
      Warranty: "1 year manufacturer",
    },
    warehouseCity: "Mumbai",
    deliveryDays: 2,
    isFeatured: true,
    isFlashDeal: false,
    supplierName: "TechHub Suppliers",
    tags: ["bestseller", "electronics", "wireless"],
    reviews: [
      {
        id: "r1",
        author: "Rohan M.",
        rating: 5,
        title: "Best headphones under 3000",
        body: "ANC works brilliantly on flights. Battery lasts almost 2 weeks with moderate use.",
        date: "2026-05-20",
        verified: true,
      },
      {
        id: "r2",
        author: "Sneha K.",
        rating: 4,
        title: "Great value for money",
        body: "Comfortable for long calls. Wish the case was more compact.",
        date: "2026-05-12",
        verified: true,
      },
    ],
  },
  {
    id: "prod-002",
    slug: "smart-fitness-watch",
    name: "Smart Fitness Watch Pro",
    shortDescription: "Heart rate, SpO2, GPS tracking & 100+ sport modes",
    description:
      "Track your fitness journey with precision. AMOLED display, 14-day battery, built-in GPS, and 100+ workout modes. Water resistant to 5ATM.",
    category: "Electronics",
    categorySlug: "electronics",
    brand: "FitPulse",
    price: 1899,
    mrp: 3499,
    images: ["/images/products/watch.jpg"],
    rating: 4.4,
    reviewCount: 892,
    inStock: true,
    stockCount: 120,
    variants: [
      { id: "v1", label: "Size", value: "42mm", inStock: true },
      { id: "v2", label: "Size", value: "46mm", inStock: true },
    ],
    features: ["AMOLED Always-On Display", "Built-in GPS", "SpO2 monitoring", "5ATM water resistant"],
    specifications: {
      Display: "1.4\" AMOLED",
      Battery: "14 days typical use",
      Sensors: "HR, SpO2, Accelerometer, Gyro",
      Compatibility: "iOS 14+, Android 8+",
    },
    warehouseCity: "Bangalore",
    deliveryDays: 3,
    isFeatured: true,
    isFlashDeal: true,
    flashDealEndsAt: "2026-06-10T23:59:59",
    supplierName: "GadgetWorld",
    tags: ["fitness", "smartwatch", "flash-deal"],
    reviews: [],
  },
  {
    id: "prod-003",
    slug: "digital-air-fryer-5l",
    name: "Digital Air Fryer 5L",
    shortDescription: "Oil-free cooking with 8 preset programs",
    description:
      "Cook healthier meals with 85% less oil. 5L capacity, digital touch panel, 8 preset programs, and dishwasher-safe basket.",
    category: "Kitchen",
    categorySlug: "kitchen",
    brand: "ChefEase",
    price: 3299,
    mrp: 5999,
    images: ["/images/products/air-fryer.jpg"],
    rating: 4.7,
    reviewCount: 2156,
    inStock: true,
    stockCount: 34,
    variants: [{ id: "v1", label: "Capacity", value: "5 Litres", inStock: true }],
    features: ["8 preset cooking programs", "Digital touch panel", "Non-stick basket", "Auto shut-off"],
    specifications: {
      Capacity: "5 Litres",
      Power: "1500W",
      Temperature: "80°C - 200°C",
      Timer: "1-60 minutes",
    },
    warehouseCity: "Delhi",
    deliveryDays: 2,
    isFeatured: false,
    isFlashDeal: true,
    flashDealEndsAt: "2026-06-08T18:00:00",
    supplierName: "HomeKitchen Co.",
    tags: ["kitchen", "air-fryer", "bestseller"],
    reviews: [],
  },
  {
    id: "prod-004",
    slug: "premium-yoga-mat",
    name: "Premium Non-Slip Yoga Mat",
    shortDescription: "6mm TPE eco-friendly mat with alignment lines",
    description:
      "Professional-grade TPE yoga mat with superior grip and cushioning. Includes carry strap and alignment markers.",
    category: "Fitness",
    categorySlug: "fitness",
    brand: "ZenFlex",
    price: 899,
    mrp: 1499,
    images: ["/images/products/yoga-mat.jpg"],
    rating: 4.5,
    reviewCount: 567,
    inStock: true,
    stockCount: 200,
    variants: [
      { id: "v1", label: "Color", value: "Ocean Blue", inStock: true },
      { id: "v2", label: "Color", value: "Forest Green", inStock: true },
      { id: "v3", label: "Color", value: "Sunset Orange", inStock: true },
    ],
    features: ["6mm TPE cushioning", "Non-slip on both sides", "Alignment lines", "Eco-friendly material"],
    specifications: {
      Material: "TPE (Thermoplastic Elastomer)",
      Dimensions: "183 x 61 cm",
      Thickness: "6mm",
      Weight: "1.2 kg",
    },
    warehouseCity: "Pune",
    deliveryDays: 3,
    isFeatured: false,
    isFlashDeal: false,
    supplierName: "FitLife Supplies",
    tags: ["fitness", "yoga"],
    reviews: [],
  },
  {
    id: "prod-005",
    slug: "modern-table-lamp",
    name: "Modern Minimalist Table Lamp",
    shortDescription: "Touch dimmable LED with warm/cool modes",
    description:
      "Scandinavian-inspired table lamp with touch dimming, 3 color temperatures, and USB charging port.",
    category: "Home Decor",
    categorySlug: "home-decor",
    brand: "LumiCraft",
    price: 1299,
    mrp: 2199,
    images: ["/images/products/lamp.jpg"],
    rating: 4.3,
    reviewCount: 341,
    inStock: true,
    stockCount: 56,
    variants: [{ id: "v1", label: "Finish", value: "Matte White", inStock: true }],
    features: ["Touch dimming", "3 color temperatures", "USB charging port", "Energy efficient LED"],
    specifications: {
      Material: "Aluminum + ABS",
      "Color Temperature": "2700K / 4000K / 6500K",
      Power: "12W LED",
      Height: "45 cm",
    },
    warehouseCity: "Mumbai",
    deliveryDays: 2,
    isFeatured: true,
    isFlashDeal: false,
    supplierName: "DecorHub India",
    tags: ["home-decor", "lighting"],
    reviews: [],
  },
  {
    id: "prod-006",
    slug: "kitchen-utensil-set",
    name: "12-Piece Kitchen Utensil Set",
    shortDescription: "Silicone heat-resistant cooking tools",
    description:
      "Complete 12-piece silicone utensil set with wooden handles. Heat resistant up to 230°C, non-scratch, dishwasher safe.",
    category: "Kitchen",
    categorySlug: "kitchen",
    brand: "ChefEase",
    price: 749,
    mrp: 1299,
    images: ["/images/products/kitchen-set.jpg"],
    rating: 4.2,
    reviewCount: 423,
    inStock: true,
    stockCount: 89,
    variants: [{ id: "v1", label: "Set", value: "12 Pieces", inStock: true }],
    features: ["Heat resistant to 230°C", "Non-scratch silicone", "Wooden handles", "Dishwasher safe"],
    specifications: {
      Material: "Food-grade silicone + wood",
      Pieces: "12",
      "Heat Resistance": "230°C",
      Care: "Dishwasher safe",
    },
    warehouseCity: "Chennai",
    deliveryDays: 4,
    isFeatured: false,
    isFlashDeal: false,
    supplierName: "HomeKitchen Co.",
    tags: ["kitchen", "utensils"],
    reviews: [],
  },
  {
    id: "prod-007",
    slug: "bluetooth-portable-speaker",
    name: "Bluetooth Portable Speaker",
    shortDescription: "360° sound, 20W output, IPX7 waterproof",
    description:
      "Premium portable speaker with 360° surround sound, 20W dual drivers, and 12-hour battery. IPX7 waterproof rating makes it perfect for pool parties and outdoor adventures.",
    category: "Electronics",
    categorySlug: "electronics",
    brand: "SoundMax",
    price: 1499,
    mrp: 2999,
    images: ["/images/products/speaker.jpg"],
    rating: 4.5,
    reviewCount: 743,
    inStock: true,
    stockCount: 65,
    variants: [
      { id: "v1", label: "Color", value: "Charcoal Black", inStock: true },
      { id: "v2", label: "Color", value: "Ocean Blue", inStock: true },
    ],
    features: ["360° surround sound", "IPX7 waterproof", "12-hour battery", "USB-C fast charging"],
    specifications: { Power: "20W", Battery: "12 hours", Waterproof: "IPX7", Connectivity: "Bluetooth 5.0" },
    warehouseCity: "Bangalore",
    deliveryDays: 3,
    isFeatured: true,
    isFlashDeal: false,
    supplierName: "TechHub Suppliers",
    tags: ["electronics", "speaker", "bluetooth"],
    reviews: [],
  },
  {
    id: "prod-008",
    slug: "premium-cotton-bedsheet-set",
    name: "Premium Cotton Bedsheet Set",
    shortDescription: "100% Egyptian cotton, 300 thread count, king size",
    description:
      "Luxuriously soft 100% Egyptian cotton bedsheet set with 300 thread count. Includes 1 flat sheet, 1 fitted sheet, and 2 pillowcases. Breathable and durable.",
    category: "Home Decor",
    categorySlug: "home-decor",
    brand: "ComfortWeave",
    price: 1899,
    mrp: 3499,
    images: ["/images/products/bedsheet.jpg"],
    rating: 4.6,
    reviewCount: 512,
    inStock: true,
    stockCount: 78,
    variants: [
      { id: "v1", label: "Size", value: "King", inStock: true },
      { id: "v2", label: "Size", value: "Queen", inStock: true },
    ],
    features: ["100% Egyptian cotton", "300 thread count", "Breathable weave", "Machine washable"],
    specifications: { Material: "Egyptian Cotton", "Thread Count": "300", Size: "King (274x274 cm)", Pieces: "4" },
    warehouseCity: "Mumbai",
    deliveryDays: 2,
    isFeatured: false,
    isFlashDeal: true,
    flashDealEndsAt: "2026-06-12T23:59:59",
    supplierName: "DecorHub India",
    tags: ["home-decor", "bedding", "cotton"],
    reviews: [],
  },
  {
    id: "prod-009",
    slug: "resistance-bands-set",
    name: "Resistance Bands Set (5 Levels)",
    shortDescription: "5 color-coded bands from light to extra heavy",
    description:
      "Complete home workout resistance band set with 5 levels of resistance. Includes door anchor, handles, ankle straps, and carry bag. Perfect for strength training at home.",
    category: "Fitness",
    categorySlug: "fitness",
    brand: "PowerFlex",
    price: 599,
    mrp: 999,
    images: ["/images/products/resistance-bands.jpg"],
    rating: 4.4,
    reviewCount: 891,
    inStock: true,
    stockCount: 150,
    variants: [{ id: "v1", label: "Set", value: "5 Bands + Accessories", inStock: true }],
    features: ["5 resistance levels", "Door anchor included", "Ankle straps", "Carry bag"],
    specifications: { Bands: "5 levels", Material: "Natural latex", "Max Resistance": "50 kg", Accessories: "Handles, anchor, straps" },
    warehouseCity: "Pune",
    deliveryDays: 3,
    isFeatured: false,
    isFlashDeal: false,
    supplierName: "FitLife Supplies",
    tags: ["fitness", "workout", "resistance"],
    reviews: [],
  },
  {
    id: "prod-010",
    slug: "insulated-steel-water-bottle",
    name: "Insulated Steel Water Bottle 1L",
    shortDescription: "Keeps drinks cold 24hr, hot 12hr — BPA free",
    description:
      "Double-wall vacuum insulated stainless steel bottle. Keeps beverages cold for 24 hours and hot for 12 hours. Leak-proof lid, BPA-free, fits standard cup holders.",
    category: "Kitchen",
    categorySlug: "kitchen",
    brand: "HydroKeep",
    price: 649,
    mrp: 1199,
    images: ["/images/products/water-bottle.jpg"],
    rating: 4.7,
    reviewCount: 1024,
    inStock: true,
    stockCount: 200,
    variants: [
      { id: "v1", label: "Color", value: "Matte Black", inStock: true },
      { id: "v2", label: "Color", value: "Steel Silver", inStock: true },
      { id: "v3", label: "Color", value: "Forest Green", inStock: true },
    ],
    features: ["24hr cold retention", "12hr hot retention", "BPA-free", "Leak-proof lid"],
    specifications: { Capacity: "1 Litre", Material: "304 Stainless Steel", Insulation: "Double-wall vacuum", Weight: "350g" },
    warehouseCity: "Delhi",
    deliveryDays: 2,
    isFeatured: true,
    isFlashDeal: false,
    supplierName: "HomeKitchen Co.",
    tags: ["kitchen", "bottle", "bestseller"],
    reviews: [],
  },
  {
    id: "prod-011",
    slug: "mens-casual-sneakers",
    name: "Men's Casual Sneakers",
    shortDescription: "Lightweight mesh upper, cushioned sole, all-day comfort",
    description:
      "Stylish and comfortable casual sneakers with breathable mesh upper and memory foam insole. Perfect for everyday wear, walking, and light workouts.",
    category: "Fashion",
    categorySlug: "fashion",
    brand: "StrideCo",
    price: 1799,
    mrp: 3499,
    images: ["/images/products/sneakers.jpg"],
    rating: 4.3,
    reviewCount: 678,
    inStock: true,
    stockCount: 45,
    variants: [
      { id: "v1", label: "Size", value: "UK 8", inStock: true },
      { id: "v2", label: "Size", value: "UK 9", inStock: true },
      { id: "v3", label: "Size", value: "UK 10", inStock: true },
      { id: "v4", label: "Size", value: "UK 11", inStock: false },
    ],
    features: ["Breathable mesh upper", "Memory foam insole", "Rubber outsole", "Lightweight design"],
    specifications: { Upper: "Mesh + Synthetic", Sole: "Rubber", Weight: "280g per shoe", Closure: "Lace-up" },
    warehouseCity: "Mumbai",
    deliveryDays: 3,
    isFeatured: true,
    isFlashDeal: true,
    flashDealEndsAt: "2026-06-09T20:00:00",
    supplierName: "FashionHub India",
    tags: ["fashion", "sneakers", "footwear"],
    reviews: [],
  },
  {
    id: "prod-012",
    slug: "vitamin-c-face-serum",
    name: "Vitamin C Face Serum 30ml",
    shortDescription: "20% Vitamin C + Hyaluronic Acid for glowing skin",
    description:
      "Potent brightening serum with 20% Vitamin C, Hyaluronic Acid, and Vitamin E. Reduces dark spots, evens skin tone, and boosts radiance. Dermatologist tested, paraben-free.",
    category: "Beauty",
    categorySlug: "beauty",
    brand: "GlowLab",
    price: 499,
    mrp: 899,
    images: ["/images/products/face-serum.jpg"],
    rating: 4.8,
    reviewCount: 2341,
    inStock: true,
    stockCount: 300,
    variants: [{ id: "v1", label: "Size", value: "30ml", inStock: true }],
    features: ["20% Vitamin C", "Hyaluronic Acid", "Paraben-free", "Dermatologist tested"],
    specifications: { Volume: "30ml", "Key Ingredients": "Vit C, HA, Vit E", "Skin Type": "All types", "Shelf Life": "24 months" },
    warehouseCity: "Hyderabad",
    deliveryDays: 2,
    isFeatured: true,
    isFlashDeal: false,
    supplierName: "BeautyDirect",
    tags: ["beauty", "skincare", "bestseller"],
    reviews: [],
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return MOCK_PRODUCTS.find((p) => p.slug === slug);
}

export function getProductsByCategory(categorySlug: string): Product[] {
  return MOCK_PRODUCTS.filter((p) => p.categorySlug === categorySlug);
}

export function getFeaturedProducts(): Product[] {
  return MOCK_PRODUCTS.filter((p) => p.isFeatured);
}

export function getFlashDealProducts(): Product[] {
  return MOCK_PRODUCTS.filter((p) => p.isFlashDeal);
}

export function searchProducts(query: string): Product[] {
  const q = query.toLowerCase();
  return MOCK_PRODUCTS.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.tags.some((t) => t.includes(q))
  );
}

export function filterProducts(options: {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "price-asc" | "price-desc" | "rating" | "newest";
  flashDeals?: boolean;
}): Product[] {
  let result = [...MOCK_PRODUCTS];

  if (options.flashDeals) {
    result = result.filter((p) => p.isFlashDeal);
  }
  if (options.category && options.category !== "all") {
    result = result.filter((p) => p.categorySlug === options.category);
  }
  if (options.minPrice !== undefined) {
    result = result.filter((p) => p.price >= options.minPrice!);
  }
  if (options.maxPrice !== undefined) {
    result = result.filter((p) => p.price <= options.maxPrice!);
  }

  switch (options.sort) {
    case "price-asc":
      result.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      result.sort((a, b) => b.price - a.price);
      break;
    case "rating":
      result.sort((a, b) => b.rating - a.rating);
      break;
    default:
      break;
  }

  return result;
}

export function getAllCategoriesFromProducts(): string[] {
  return Array.from(new Set(MOCK_PRODUCTS.map((p) => p.categorySlug)));
}
