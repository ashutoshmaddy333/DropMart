import type { OrderStatus } from "@/lib/constants";

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

export interface OrderAddress {
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  status: OrderStatus;
  paymentMethod: "razorpay" | "stripe" | "cod";
  paymentStatus: "paid" | "pending" | "refunded" | "failed";
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  address: OrderAddress;
  supplierName: string;
  warehouseCity: string;
  trackingId?: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}
