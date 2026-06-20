export interface AuthUser {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  avatar: string | null;
  role: string;
  roleLabel: string;
  permissions: string[];
  supplier: {
    id: string;
    businessName: string;
    status: string;
    statusLabel: string;
  } | null;
  deliveryBoyId: string | null;
}

export interface AuthResponse {
  accessToken: string;
  csrfToken: string;
  user: AuthUser;
}

export type { ApiProduct } from "./products";
export { toStorefrontProduct } from "./products";

export interface TrackingData {
  orderId: string;
  assignmentId?: string;
  lat: number | null;
  lng: number | null;
  heading?: number;
  speed?: number;
  pickupLat?: number | null;
  pickupLng?: number | null;
  dropLat?: number | null;
  dropLng?: number | null;
  status: string;
  statusLabel: string;
  estimatedMins?: number | null;
  deliveryBoy?: {
    name: string;
    phone: string | null;
    vehicleNo: string | null;
  };
  route?: { lat: number; lng: number; recordedAt: string }[];
  timestamp?: string;
  redisLive?: boolean;
  distanceKm?: number | null;
  nearbyRadiusM?: number;
}

export interface ApiOrder {
  id: string;
  orderNumber: string;
  customerName?: string;
  customerEmail?: string;
  supplierName?: string;
  status: string;
  statusLabel: string;
  statusColor?: string | null;
  paymentMethod: string;
  paymentMethodLabel?: string;
  paymentStatus: string;
  paymentStatusLabel?: string;
  subtotal: number;
  shipping: number;
  discount?: number;
  total: number;
  trackingId?: string | null;
  warehouseCity: string;
  notes?: string | null;
  items: { productId: string; name: string; quantity: number; price: number; image: string | null }[];
  address?: {
    name: string;
    phone: string;
    line1: string;
    city: string;
    state: string;
    pincode: string;
    lat?: number | null;
    lng?: number | null;
  };
  delivery?: {
    id: string;
    lat: number | null;
    lng: number | null;
    estimatedMins: number | null;
    status: string;
    statusLabel: string;
    deliveryBoyName?: string;
    deliveryBoyPhone?: string | null;
  } | null;
  timeline?: OrderTimelineStep[];
  waitingFor?: "supplier_pack" | "admin_assign_rider" | "delivery_partner" | null;
  waitingLabel?: string | null;
  canTrackLive?: boolean;
  statusHistory?: { toStatus: string; at: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderTimelineStep {
  code: string;
  label: string;
  description: string;
  state: "done" | "active" | "pending";
  at?: string;
}

export interface DeliveryBoy {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string | null;
  vehicleNo: string | null;
  isOnline: boolean;
  currentLat: number | null;
  currentLng: number | null;
}

export interface FleetRider {
  assignmentId: string;
  orderId: string;
  orderNumber: string;
  lat: number | null;
  lng: number | null;
  dropLat: number | null;
  dropLng: number | null;
  distanceKm: number | null;
  status: string;
  statusLabel: string;
  estimatedMins: number | null;
  riderName: string;
  riderPhone: string | null;
  vehicleNo: string | null;
  redisLive: boolean;
}

export interface DeliveryAssignment {
  id: string;
  orderId: string;
  orderNumber: string;
  status: string;
  statusLabel: string;
  statusColor?: string | null;
  lat: number | null;
  lng: number | null;
  pickupLat?: number | null;
  pickupLng?: number | null;
  dropLat?: number | null;
  dropLng?: number | null;
  estimatedMins?: number | null;
  customerName?: string;
  customerPhone?: string | null;
  address?: {
    name: string;
    phone: string;
    line1: string;
    city: string;
    lat?: number | null;
    lng?: number | null;
  } | null;
  deliveryBoyName?: string;
  assignedAt: string;
  pickedUpAt?: string | null;
  deliveredAt?: string | null;
}
