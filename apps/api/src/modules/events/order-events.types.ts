export type OrderEventType =
  | "order.payment_confirmed"
  | "order.processing"
  | "order.packed"
  | "order.out_for_delivery"
  | "order.delivered"
  | "order.payment_failed"
  | "order.cancelled";

export interface OrderEventPayload {
  type: OrderEventType;
  orderId: string;
  orderNumber: string;
  customerId: string;
  customerEmail: string;
  customerName: string;
  supplierId: string;
  total: number;
  status: string;
  paymentMethod: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}
