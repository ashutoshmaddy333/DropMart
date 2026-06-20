import type { PrismaClient } from "@prisma/client";

export async function seedBusinessData(prisma: PrismaClient, users: Record<string, { id: string }>) {
  const superAdmin = users["ashutoshkumarm416@gmail.com"];
  const customer = users["arjun@gmail.com"];
  const deliveryUser = users["ravi@delivery.in"];
  const supplierUser = users["meera@supplier.in"];
  const pendingSupplierUser = users["new@supplier.in"];

  const verifiedStatus = await prisma.masterSupplierStatus.findUnique({ where: { code: "verified" } });
  const pendingStatus = await prisma.masterSupplierStatus.findUnique({ where: { code: "pending_verification" } });
  const approvedProductStatus = await prisma.masterProductStatus.findUnique({ where: { code: "approved" } });

  console.log("  → suppliers");
  const supplier = await prisma.supplier.upsert({
    where: { userId: supplierUser.id },
    update: {},
    create: {
      userId: supplierUser.id,
      businessName: "Meera Traders Pvt Ltd",
      warehouseCity: "Mumbai",
      gstNumber: "27AABCU9603R1ZM",
      statusId: verifiedStatus!.id,
      verifiedAt: new Date(),
      verifiedById: superAdmin.id,
    },
  });

  await prisma.supplier.upsert({
    where: { userId: pendingSupplierUser.id },
    update: {},
    create: {
      userId: pendingSupplierUser.id,
      businessName: "New Supplier Co",
      warehouseCity: "Delhi",
      statusId: pendingStatus!.id,
    },
  });

  console.log("  → delivery_boys");
  await prisma.deliveryBoy.upsert({
    where: { userId: deliveryUser.id },
    update: {},
    create: {
      userId: deliveryUser.id,
      vehicleNo: "MH-01-AB-1234",
      isOnline: true,
      currentLat: 19.076,
      currentLng: 72.8777,
    },
  });

  const electronics = await prisma.masterCategory.findUnique({ where: { slug: "electronics" } });
  const kitchen = await prisma.masterCategory.findUnique({ where: { slug: "kitchen" } });
  const fitness = await prisma.masterCategory.findUnique({ where: { slug: "fitness" } });

  const products = [
    {
      slug: "premium-wireless-headphones",
      name: "Premium Wireless Headphones",
      description: "High-quality wireless headphones with active noise cancellation.",
      shortDescription: "ANC wireless headphones with 30hr battery",
      brand: "SoundMax",
      price: 2499,
      mrp: 4999,
      images: ["/images/products/headphones.jpg"],
      stockCount: 50,
      warehouseCity: "Mumbai",
      deliveryDays: 3,
      features: ["Active Noise Cancellation", "30hr Battery", "Bluetooth 5.3"],
      specifications: { Driver: "40mm", Weight: "250g" },
      tags: ["electronics", "audio"],
      categoryId: electronics!.id,
    },
    {
      slug: "smart-fitness-watch",
      name: "Smart Fitness Watch",
      description: "Track your health and fitness with this advanced smartwatch.",
      shortDescription: "Health tracking smartwatch with GPS",
      brand: "FitTrack",
      price: 3999,
      mrp: 7999,
      images: ["/images/products/watch.jpg"],
      stockCount: 30,
      warehouseCity: "Mumbai",
      deliveryDays: 2,
      features: ["Heart Rate Monitor", "GPS", "Water Resistant"],
      specifications: { Display: "1.4 AMOLED", Battery: "7 days" },
      tags: ["fitness", "wearable"],
      categoryId: fitness!.id,
    },
    {
      slug: "digital-air-fryer-5l",
      name: "Digital Air Fryer 5L",
      description: "Cook healthier meals with 85% less oil.",
      shortDescription: "5L digital air fryer with presets",
      brand: "KitchenPro",
      price: 4999,
      mrp: 8999,
      images: ["/images/products/air-fryer.jpg"],
      stockCount: 20,
      warehouseCity: "Mumbai",
      deliveryDays: 4,
      features: ["8 Presets", "Digital Display", "Non-stick Basket"],
      specifications: { Capacity: "5L", Power: "1500W" },
      tags: ["kitchen", "appliance"],
      categoryId: kitchen!.id,
    },
  ];

  console.log("  → products");
  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        ...p,
        supplierId: supplier.id,
        statusId: approvedProductStatus!.id,
        approvedAt: new Date(),
        approvedById: superAdmin.id,
        isFeatured: true,
        specifications: p.specifications,
      },
    });
  }

  const shippedOrderStatus = await prisma.masterOrderStatus.findUnique({ where: { code: "shipped" } });
  const paidStatus = await prisma.masterPaymentStatus.findUnique({ where: { code: "paid" } });
  const razorpay = await prisma.masterPaymentMethod.findUnique({ where: { code: "razorpay" } });
  const inTransit = await prisma.masterDeliveryStatus.findUnique({ where: { code: "in_transit" } });
  const headphones = await prisma.product.findUnique({ where: { slug: "premium-wireless-headphones" } });
  const deliveryBoy = await prisma.deliveryBoy.findUnique({ where: { userId: deliveryUser.id } });

  if (headphones && deliveryBoy) {
    console.log("  → orders + delivery_assignments");
    const order = await prisma.order.upsert({
      where: { orderNumber: "DM-2026-00001" },
      update: {},
      create: {
        orderNumber: "DM-2026-00001",
        customerId: customer.id,
        supplierId: supplier.id,
        statusId: shippedOrderStatus!.id,
        paymentMethodId: razorpay!.id,
        paymentStatusId: paidStatus!.id,
        subtotal: 2499,
        shipping: 0,
        total: 2499,
        warehouseCity: "Mumbai",
        trackingId: "SR123456789",
        items: {
          create: [{
            productId: headphones.id,
            name: headphones.name,
            quantity: 1,
            price: 2499,
            image: headphones.images[0],
          }],
        },
        address: {
          create: {
            name: "Arjun Kumar",
            phone: "+91 7355552418",
            line1: "42 Marine Drive",
            city: "Mumbai",
            state: "Maharashtra",
            pincode: "400002",
            lat: 18.9432,
            lng: 72.8236,
          },
        },
      },
    });

    await prisma.deliveryAssignment.upsert({
      where: { orderId: order.id },
      update: {},
      create: {
        orderId: order.id,
        deliveryBoyId: deliveryBoy.id,
        statusId: inTransit!.id,
        pickupLat: 19.076,
        pickupLng: 72.8777,
        dropLat: 18.9432,
        dropLng: 72.8236,
        currentLat: 18.98,
        currentLng: 72.85,
        estimatedMins: 12,
        pickedUpAt: new Date(Date.now() - 20 * 60 * 1000),
      },
    });
  }
}
