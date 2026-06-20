"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { apiFetch } from "@/lib/api/client";
import { logout, logoutUser } from "@/store/slices/authSlice";
import type { DeliveryAssignment } from "@/lib/api/types";
import { GoogleTrackingMap } from "@/components/tracking/google-tracking-map";
import { TrackingStatusBar } from "@/components/tracking/tracking-status-bar";
import { NotificationsBell } from "@/components/shared/notifications-bell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/shared/icon";
import { SITE_NAME } from "@/lib/constants";
import { formatDistance, haversineKm } from "@/lib/tracking/geo";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const STATUS_FLOW = ["assigned", "picked_up", "in_transit", "nearby", "delivered"];

export default function DeliveryPortalPage() {
  const { token } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [assignments, setAssignments] = useState<DeliveryAssignment[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [tracking, setTracking] = useState(false);
  const [lastPos, setLastPos] = useState<{ lat: number; lng: number } | null>(null);
  const watchId = useRef<number | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    const data = await apiFetch<DeliveryAssignment[]>("/delivery/my-assignments", { token });
    setAssignments(data);
    if (!activeId && data.length) setActiveId(data[0].id);
  }, [token, activeId]);

  useEffect(() => {
    load().catch(console.error);
  }, [load]);

  const active = assignments.find((a) => a.id === activeId);

  const distToDrop =
    lastPos && active?.dropLat && active?.dropLng
      ? haversineKm(lastPos.lat, lastPos.lng, active.dropLat, active.dropLng)
      : null;

  async function sendLocation(position: GeolocationPosition) {
    if (!token || !activeId) return;
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    setLastPos({ lat, lng });
    try {
      const res = await apiFetch<{ status: string; statusLabel: string }>("/tracking/location", {
        method: "POST",
        token,
        body: JSON.stringify({
          assignmentId: activeId,
          lat,
          lng,
          heading: position.coords.heading ?? undefined,
          speed: position.coords.speed ?? undefined,
        }),
      });
      if (res.status && active && res.status !== active.status) {
        toast.success(`Auto-updated: ${res.statusLabel}`, {
          description: "Geofence detected movement — customer notified.",
        });
        load();
      }
    } catch {
      /* retry next tick */
    }
  }

  function startTracking() {
    if (!navigator.geolocation) {
      toast.error("GPS not available on this device");
      return;
    }
    setTracking(true);
    watchId.current = navigator.geolocation.watchPosition(
      (pos) => sendLocation(pos),
      () => toast.error("Could not get GPS location — allow location permission"),
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 15000 },
    );
    toast.success("Live GPS started — customers see you on the map");
  }

  function stopTracking() {
    setTracking(false);
    if (watchId.current != null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
  }

  async function updateStatus(statusCode: string) {
    if (!token || !activeId) return;
    await apiFetch(`/delivery/${activeId}/status`, {
      method: "PATCH",
      token,
      body: JSON.stringify({ statusCode }),
    });
    toast.success(`Status: ${statusCode.replace(/_/g, " ")}`);
    if (statusCode === "delivered") stopTracking();
    load();
  }

  async function handleLogout() {
    stopTracking();
    await dispatch(logoutUser());
    dispatch(logout());
    router.push("/login");
  }

  const nextStatus = active ? STATUS_FLOW[STATUS_FLOW.indexOf(active.status) + 1] : null;

  const mapCenter = lastPos ?? (active?.lat && active?.lng ? { lat: active.lat, lng: active.lng } : { lat: 19.076, lng: 72.8777 });

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="flex h-14 items-center justify-between border-b border-white/10 px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand">
            <Icon name="truck" size={18} className="invert" />
          </div>
          <div>
            <p className="text-sm font-bold">{SITE_NAME} Rider</p>
            <p className="text-[10px] text-white/60">Live delivery portal</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <NotificationsBell className="[&_button]:border-white/20 [&_button]:bg-slate-900 [&_button]:text-white" />
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/10" onClick={handleLogout}>
            Sign Out
          </Button>
        </div>
      </header>

      {assignments.length === 0 ? (
        <div className="mx-auto max-w-lg p-8 text-center text-white/60">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/5">
            <Icon name="truck" size={32} className="opacity-40 invert" />
          </div>
          <p className="text-lg font-medium text-white">No active deliveries</p>
          <p className="mt-1 text-sm">Wait for admin to assign an order at /admin/delivery</p>
        </div>
      ) : (
        <div className="mx-auto max-w-lg pb-8">
          {/* Map hero */}
          {active && (
            <div className="relative">
              <GoogleTrackingMap
                center={mapCenter}
                livePoint={lastPos ?? undefined}
                height={280}
                className="rounded-none border-0"
                geofenceCenter={
                  active.dropLat && active.dropLng ? { lat: active.dropLat, lng: active.dropLng } : undefined
                }
                points={[
                  ...(active.dropLat && active.dropLng
                    ? [{ lat: active.dropLat, lng: active.dropLng, label: "Delivery", color: "#ef4444" }]
                    : []),
                ]}
              />
              <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-slate-950/95 p-4 shadow-2xl backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-mono text-xs text-brand">{active.orderNumber}</p>
                    <p className="font-semibold">{active.customerName}</p>
                    <p className="text-xs text-white/70">
                      {active.address?.line1}, {active.address?.city}
                    </p>
                  </div>
                  {distToDrop != null && (
                    <div className="text-right">
                      <p className="text-2xl font-bold text-brand">{formatDistance(distToDrop)}</p>
                      <p className="text-[10px] text-white/60">to customer</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Assignment tabs */}
          <div className="flex gap-2 overflow-x-auto px-4 py-3">
            {assignments.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => {
                  setActiveId(a.id);
                  stopTracking();
                  setLastPos(null);
                }}
                className={cn(
                  "shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-colors",
                  activeId === a.id ? "bg-brand text-brand-foreground" : "bg-white/10 text-white/80",
                )}
              >
                {a.orderNumber}
              </button>
            ))}
          </div>

          {active && (
            <div className="space-y-4 px-4">
              <div className="rounded-2xl bg-slate-900 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <Badge className="bg-white/10 text-white hover:bg-white/10">{active.statusLabel}</Badge>
                  {tracking && (
                    <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                      GPS live
                    </span>
                  )}
                </div>
                <TrackingStatusBar status={active.status} variant="dark" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {!tracking ? (
                  <Button className="col-span-2 h-12 text-base font-bold" onClick={startTracking}>
                    <Icon name="map-pin" size={18} className="mr-2 invert" />
                    Start Live GPS
                  </Button>
                ) : (
                  <Button variant="destructive" className="h-12" onClick={stopTracking}>
                    Stop GPS
                  </Button>
                )}
                {nextStatus && (
                  <Button
                    variant="outline"
                    className="h-12 border-white/20 bg-transparent text-white hover:bg-white/10"
                    onClick={() => updateStatus(nextStatus)}
                  >
                    {nextStatus.replace(/_/g, " ")}
                  </Button>
                )}
              </div>

              {active.customerPhone && (
                <Button variant="outline" className="w-full border-white/20 text-white" asChild>
                  <a href={`tel:${active.customerPhone}`}>
                    <Icon name="phone" size={16} className="mr-2 invert" />
                    Call Customer
                  </a>
                </Button>
              )}

              <p className="text-center text-[11px] text-white/50">
                Geofencing auto-updates status when you move · Customer & admin get notifications
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
