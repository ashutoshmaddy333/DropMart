const R = 6371e3;

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))) / 1000;
}

export function formatDistance(km: number | null | undefined): string {
  if (km == null) return "—";
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

export const DELIVERY_STATUS_STEPS = [
  { code: "assigned", label: "Assigned" },
  { code: "picked_up", label: "Picked up" },
  { code: "in_transit", label: "On the way" },
  { code: "nearby", label: "Nearby" },
  { code: "delivered", label: "Delivered" },
] as const;

export function statusStepIndex(code: string): number {
  const idx = DELIVERY_STATUS_STEPS.findIndex((s) => s.code === code);
  return idx >= 0 ? idx : 0;
}
