/** Earth radius in metres */
const R = 6371e3;

export function haversineMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Rough ETA in minutes from distance (km) and optional speed (m/s). */
export function estimateEtaMinutes(distanceKm: number, speedMs?: number | null): number {
  if (speedMs && speedMs > 0.5) {
    return Math.max(1, Math.round((distanceKm * 1000) / speedMs / 60));
  }
  // Urban delivery ~25 km/h average
  return Math.max(1, Math.round((distanceKm / 25) * 60));
}

export const GEOFENCE = {
  /** Movement from start to mark picked up / in transit */
  movementStartM: 80,
  /** Within this radius of drop → nearby */
  nearbyRadiusM: 500,
  /** Within this radius + low speed → arrived at drop */
  arrivedRadiusM: 80,
  /** Speed below this (m/s) counts as stopped at doorstep */
  stoppedSpeedMs: 1.2,
} as const;
