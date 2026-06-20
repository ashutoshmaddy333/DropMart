import type { PrismaClient } from "@prisma/client";

export const USER_STATUSES = [
  { code: "active", label: "Active", color: "#10b981", sortOrder: 1 },
  { code: "inactive", label: "Inactive", color: "#6b7280", sortOrder: 2 },
  { code: "suspended", label: "Suspended", color: "#ef4444", sortOrder: 3 },
  { code: "pending_verification", label: "Pending Verification", color: "#f59e0b", sortOrder: 4 },
];

export const ORDER_STATUSES = [
  { code: "pending_payment", label: "Pending Payment", color: "#f59e0b", sortOrder: 1, isFinal: false },
  { code: "payment_confirmed", label: "Payment Confirmed", color: "#10b981", sortOrder: 2, isFinal: false },
  { code: "pending", label: "Pending", color: "#f59e0b", sortOrder: 3, isFinal: false },
  { code: "confirmed", label: "Confirmed", color: "#3b82f6", sortOrder: 4, isFinal: false },
  { code: "processing", label: "Processing", color: "#8b5cf6", sortOrder: 5, isFinal: false },
  { code: "packed", label: "Packed", color: "#a855f7", sortOrder: 6, isFinal: false },
  { code: "shipped", label: "Shipped", color: "#06b6d4", sortOrder: 7, isFinal: false },
  { code: "out_for_delivery", label: "Out for Delivery", color: "#0ea5e9", sortOrder: 8, isFinal: false },
  { code: "delivered", label: "Delivered", color: "#10b981", sortOrder: 9, isFinal: true },
  { code: "cancelled", label: "Cancelled", color: "#ef4444", sortOrder: 10, isFinal: true },
  { code: "refunded", label: "Refunded", color: "#6b7280", sortOrder: 11, isFinal: true },
];

export const PAYMENT_METHODS = [
  { code: "razorpay", label: "Razorpay", icon: "razorpay", sortOrder: 1 },
  { code: "stripe", label: "Stripe", icon: "stripe", sortOrder: 2 },
  { code: "cod", label: "Cash on Delivery", icon: "cod", sortOrder: 3 },
];

export const PAYMENT_STATUSES = [
  { code: "paid", label: "Paid", color: "#10b981", sortOrder: 1 },
  { code: "pending", label: "Pending", color: "#f59e0b", sortOrder: 2 },
  { code: "refunded", label: "Refunded", color: "#6b7280", sortOrder: 3 },
  { code: "failed", label: "Failed", color: "#ef4444", sortOrder: 4 },
];

export const SUPPLIER_STATUSES = [
  { code: "pending_verification", label: "Pending Verification", color: "#f59e0b", sortOrder: 1 },
  { code: "verified", label: "Verified", color: "#10b981", sortOrder: 2 },
  { code: "rejected", label: "Rejected", color: "#ef4444", sortOrder: 3 },
  { code: "suspended", label: "Suspended", color: "#6b7280", sortOrder: 4 },
];

export const PRODUCT_STATUSES = [
  { code: "draft", label: "Draft", color: "#6b7280", sortOrder: 1 },
  { code: "pending_approval", label: "Pending Approval", color: "#f59e0b", sortOrder: 2 },
  { code: "approved", label: "Approved", color: "#10b981", sortOrder: 3 },
  { code: "rejected", label: "Rejected", color: "#ef4444", sortOrder: 4 },
];

export const DELIVERY_STATUSES = [
  { code: "assigned", label: "Assigned", color: "#3b82f6", sortOrder: 1 },
  { code: "picked_up", label: "Picked Up", color: "#8b5cf6", sortOrder: 2 },
  { code: "in_transit", label: "In Transit", color: "#06b6d4", sortOrder: 3 },
  { code: "nearby", label: "Nearby", color: "#f59e0b", sortOrder: 4 },
  { code: "delivered", label: "Delivered", color: "#10b981", sortOrder: 5 },
];

export async function seedStatuses(prisma: PrismaClient) {
  console.log("  → master_user_statuses");
  for (const s of USER_STATUSES) {
    await prisma.masterUserStatus.upsert({ where: { code: s.code }, update: s, create: s });
  }
  console.log("  → master_order_statuses");
  for (const s of ORDER_STATUSES) {
    await prisma.masterOrderStatus.upsert({ where: { code: s.code }, update: s, create: s });
  }
  console.log("  → master_payment_methods");
  for (const m of PAYMENT_METHODS) {
    await prisma.masterPaymentMethod.upsert({ where: { code: m.code }, update: m, create: m });
  }
  console.log("  → master_payment_statuses");
  for (const s of PAYMENT_STATUSES) {
    await prisma.masterPaymentStatus.upsert({ where: { code: s.code }, update: s, create: s });
  }
  console.log("  → master_supplier_statuses");
  for (const s of SUPPLIER_STATUSES) {
    await prisma.masterSupplierStatus.upsert({ where: { code: s.code }, update: s, create: s });
  }
  console.log("  → master_product_statuses");
  for (const s of PRODUCT_STATUSES) {
    await prisma.masterProductStatus.upsert({ where: { code: s.code }, update: s, create: s });
  }
  console.log("  → master_delivery_statuses");
  for (const s of DELIVERY_STATUSES) {
    await prisma.masterDeliveryStatus.upsert({ where: { code: s.code }, update: s, create: s });
  }
}
