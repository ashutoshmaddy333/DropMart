export interface OrderTimelineStep {
  code: string;
  label: string;
  description: string;
  state: "done" | "active" | "pending";
  at?: string;
}

export interface OrderTrackingMeta {
  timeline: OrderTimelineStep[];
  waitingFor: "supplier_pack" | "admin_assign_rider" | "delivery_partner" | null;
  waitingLabel: string | null;
  canTrackLive: boolean;
}

const STEPS: { code: string; label: string; description: string; match: string[] }[] = [
  { code: "placed", label: "Order Placed", description: "We received your order", match: ["pending_payment", "pending"] },
  { code: "confirmed", label: "Order Confirmed", description: "Payment confirmed — preparing items", match: ["confirmed", "payment_confirmed"] },
  { code: "processing", label: "Being Prepared", description: "Supplier is packing your items", match: ["processing"] },
  { code: "packed", label: "Packed", description: "Items packed — waiting for delivery partner", match: ["packed"] },
  { code: "out_for_delivery", label: "Out for Delivery", description: "Rider is on the way to you", match: ["out_for_delivery", "shipped"] },
  { code: "delivered", label: "Delivered", description: "Order delivered successfully", match: ["delivered"] },
];

const STATUS_RANK: Record<string, number> = {
  pending_payment: 0,
  pending: 0,
  confirmed: 1,
  payment_confirmed: 1,
  processing: 2,
  packed: 3,
  shipped: 4,
  out_for_delivery: 4,
  delivered: 5,
  cancelled: -1,
  refunded: -1,
};

function stepIndexForStatus(status: string): number {
  if (status === "cancelled" || status === "refunded") return -1;
  const idx = STEPS.findIndex((s) => s.match.includes(status));
  return idx >= 0 ? idx : 0;
}

export function buildOrderTrackingMeta(input: {
  status: string;
  hasDelivery: boolean;
  deliveryStatus?: string | null;
  statusHistory?: { toStatus: string; createdAt: Date }[];
}): OrderTrackingMeta {
  const { status, hasDelivery, deliveryStatus, statusHistory = [] } = input;
  const currentIdx = stepIndexForStatus(status);
  const historyAt = (code: string) => {
    const entry = [...statusHistory].reverse().find((h) => h.toStatus === code);
    return entry?.createdAt.toISOString();
  };

  const timeline: OrderTimelineStep[] = STEPS.map((step, idx) => {
    let state: OrderTimelineStep["state"] = "pending";
    if (currentIdx < 0) state = "pending";
    else if (idx < currentIdx) state = "done";
    else if (idx === currentIdx) state = "active";
    else state = "pending";

    const at =
      historyAt(step.match[0]) ??
      (step.match.includes(status) ? historyAt(status) : undefined);

    return {
      code: step.code,
      label: step.label,
      description: step.description,
      state,
      at,
    };
  });

  let waitingFor: OrderTrackingMeta["waitingFor"] = null;
  let waitingLabel: string | null = null;

  if (status === "processing") {
    waitingFor = "supplier_pack";
    waitingLabel = "Waiting for supplier to pack your order";
  } else if (status === "packed" && !hasDelivery) {
    waitingFor = "admin_assign_rider";
    waitingLabel = "Waiting for delivery partner assignment";
  } else if ((status === "out_for_delivery" || status === "shipped") && hasDelivery) {
    waitingFor = "delivery_partner";
    waitingLabel =
      deliveryStatus === "assigned"
        ? "Rider assigned — pickup pending"
        : deliveryStatus === "picked_up"
          ? "Rider picked up your order"
          : deliveryStatus === "in_transit"
            ? "Rider is heading to you"
            : deliveryStatus === "nearby"
              ? "Rider is nearby"
              : "Delivery partner is on the way";
  }

  const canTrackLive =
    hasDelivery && (status === "out_for_delivery" || status === "shipped");

  return { timeline, waitingFor, waitingLabel, canTrackLive };
}

export function rankStatus(status: string): number {
  return STATUS_RANK[status] ?? 0;
}
