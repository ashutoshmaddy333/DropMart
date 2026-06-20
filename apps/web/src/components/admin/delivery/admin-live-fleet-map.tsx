"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAppSelector } from "@/store/hooks";
import { apiFetch } from "@/lib/api/client";
import type { FleetRider } from "@/lib/api/types";
import { GoogleTrackingMap } from "@/components/tracking/google-tracking-map";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistance } from "@/lib/tracking/geo";
import { cn } from "@/lib/utils";

export function AdminLiveFleetMap() {
  const { token } = useAppSelector((s) => s.auth);
  const [fleet, setFleet] = useState<FleetRider[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  async function load() {
    if (!token) return;
    const data = await apiFetch<FleetRider[]>("/tracking/fleet", { token });
    setFleet(data);
    if (!selected && data.length) setSelected(data[0].assignmentId);
  }

  useEffect(() => {
    load().catch(console.error);
    const interval = setInterval(() => load().catch(console.error), 10000);
    return () => clearInterval(interval);
  }, [token]);

  const active = fleet.find((f) => f.assignmentId === selected) ?? fleet[0];
  const center = active?.lat && active?.lng ? { lat: active.lat, lng: active.lng } : { lat: 19.076, lng: 72.8777 };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Live Fleet Map</h3>
          <p className="text-sm text-muted-foreground">
            Agent-wise GPS — {fleet.filter((f) => f.redisLive).length} live / {fleet.length} active
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => load()}>
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {active ? (
            <GoogleTrackingMap
              center={center}
              livePoint={active.lat && active.lng ? { lat: active.lat, lng: active.lng } : undefined}
              geofenceCenter={
                active.dropLat && active.dropLng ? { lat: active.dropLat, lng: active.dropLng } : undefined
              }
              height={420}
              points={[
                ...(active.dropLat && active.dropLng
                  ? [{ lat: active.dropLat, lng: active.dropLng, label: "Delivery", color: "#ef4444" }]
                  : []),
              ]}
            />
          ) : (
            <div className="flex h-[420px] items-center justify-center rounded-2xl border border-dashed text-muted-foreground">
              No active deliveries on map
            </div>
          )}
        </div>

        <div className="max-h-[420px] space-y-2 overflow-y-auto rounded-xl border bg-card p-2">
          {fleet.length === 0 ? (
            <p className="p-4 text-center text-sm text-muted-foreground">No riders on road</p>
          ) : (
            fleet.map((r) => (
              <button
                key={r.assignmentId}
                type="button"
                onClick={() => setSelected(r.assignmentId)}
                className={cn(
                  "w-full rounded-lg border p-3 text-left transition-colors",
                  selected === r.assignmentId ? "border-brand bg-brand/5" : "hover:bg-muted/50",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-semibold">{r.orderNumber}</span>
                  <Badge variant={r.redisLive ? "default" : "secondary"} className="text-[10px]">
                    {r.redisLive ? "LIVE" : r.statusLabel}
                  </Badge>
                </div>
                <p className="mt-1 text-sm font-medium">{r.riderName}</p>
                <p className="text-xs text-muted-foreground">
                  {r.vehicleNo ?? "—"} · {formatDistance(r.distanceKm)} · ETA {r.estimatedMins ?? "—"}m
                </p>
                <Button variant="link" size="sm" className="mt-1 h-auto p-0 text-xs" asChild>
                  <Link href={`/track/${r.orderId}`} target="_blank">
                    Open customer map →
                  </Link>
                </Button>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
