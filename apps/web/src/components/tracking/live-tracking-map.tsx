"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { apiFetch, API_BASE } from "@/lib/api/client";
import { setTrackingData, updateLiveLocation, setConnected, clearTracking } from "@/store/slices/trackingSlice";
import type { TrackingData } from "@/lib/api/types";
import { GoogleTrackingMap } from "@/components/tracking/google-tracking-map";
import { TrackingStatusBar } from "@/components/tracking/tracking-status-bar";
import { Icon } from "@/components/shared/icon";
import { cn } from "@/lib/utils";
import { formatDistance } from "@/lib/tracking/geo";

const WS_URL = API_BASE.replace("/api/v1", "");

interface LiveTrackingMapProps {
  orderId: string;
  variant?: "default" | "fullscreen";
  showStatusBar?: boolean;
}

export function LiveTrackingMap({
  orderId,
  variant = "default",
  showStatusBar = true,
}: LiveTrackingMapProps) {
  const dispatch = useAppDispatch();
  const { data, connected } = useAppSelector((s) => s.tracking);
  const socketRef = useRef<Socket | null>(null);
  const prevStatus = useRef<string | null>(null);

  useEffect(() => {
    apiFetch<TrackingData>(`/tracking/${orderId}`)
      .then((d) => dispatch(setTrackingData(d)))
      .catch(() => {
        /* public track page may load before assignment exists */
      });

    const socket = io(`${WS_URL}/tracking`, { transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      dispatch(setConnected(true));
      socket.emit("join_order", orderId);
    });
    socket.on("disconnect", () => dispatch(setConnected(false)));
    socket.on("tracking_update", (update: Partial<TrackingData>) => {
      dispatch(updateLiveLocation(update));
    });
    socket.on("order_status_update", () => {
      apiFetch<TrackingData>(`/tracking/${orderId}`)
        .then((d) => dispatch(setTrackingData(d)))
        .catch(console.error);
    });

    return () => {
      socket.disconnect();
      dispatch(clearTracking());
    };
  }, [orderId, dispatch]);

  useEffect(() => {
    if (!data?.status || data.status === prevStatus.current) return;
    if (prevStatus.current && data.status !== prevStatus.current) {
      toast.info(data.statusLabel ?? "Delivery status updated", {
        description: "Live map refreshed with new rider position.",
      });
    }
    prevStatus.current = data.status;
  }, [data?.status, data?.statusLabel]);

  const lat = data?.lat ?? 19.076;
  const lng = data?.lng ?? 72.8777;
  const dropLat = data?.dropLat ?? lat;
  const dropLng = data?.dropLng ?? lng;
  const pickupLat = data?.pickupLat ?? lat;
  const pickupLng = data?.pickupLng ?? lng;
  const livePoint = data?.lat != null && data?.lng != null ? { lat: data.lat, lng: data.lng } : undefined;
  const isFullscreen = variant === "fullscreen";
  const mapHeight = isFullscreen ? "calc(100vh - 280px)" : 440;

  if (!data && !connected) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/30 p-8 text-center">
        <div className="mb-4 h-10 w-10 animate-spin rounded-full border-2 border-brand border-t-transparent" />
        <p className="font-medium">Connecting to live tracking...</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Map activates when a delivery partner is assigned and shares GPS.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("relative", isFullscreen && "min-h-[70vh]")}>
      {/* Top status pill — Uber style */}
      <div className="absolute left-4 right-4 top-4 z-10 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 rounded-full bg-slate-950/90 px-4 py-2 text-white shadow-xl backdrop-blur-md">
          <span
            className={cn(
              "h-2.5 w-2.5 rounded-full",
              connected && data?.redisLive ? "animate-pulse bg-emerald-400" : connected ? "bg-amber-400" : "bg-red-400",
            )}
          />
          <span className="text-sm font-semibold">
            {data?.statusLabel ?? "Waiting for rider"}
          </span>
        </div>
        {data?.estimatedMins != null && (
          <div className="rounded-full bg-brand px-4 py-2 text-sm font-bold text-brand-foreground shadow-xl">
            {data.estimatedMins} min
          </div>
        )}
      </div>

      <GoogleTrackingMap
        center={{ lat, lng }}
        livePoint={livePoint}
        heading={data?.heading}
        route={data?.route}
        geofenceCenter={dropLat && dropLng ? { lat: dropLat, lng: dropLng } : undefined}
        geofenceRadiusM={(data?.nearbyRadiusM ?? 0.5) * 1000}
        height={mapHeight}
        className="shadow-2xl ring-1 ring-black/10"
        points={[
          { lat: pickupLat, lng: pickupLng, label: "Pickup", color: "#10b981" },
          { lat: dropLat, lng: dropLng, label: "Delivery", color: "#ef4444" },
        ]}
      />

      {/* Bottom sheet — solid background for readability */}
      <div
        className={cn(
          "rounded-t-3xl border border-b-0 bg-card shadow-[0_-8px_40px_rgba(0,0,0,0.15)]",
          isFullscreen ? "absolute bottom-0 left-0 right-0" : "relative -mt-6 mx-0",
        )}
      >
        <div className="mx-auto mb-3 mt-3 h-1 w-12 rounded-full bg-muted" />

        {showStatusBar && data?.status && (
          <div className="border-b px-5 pb-4 pt-1">
            <TrackingStatusBar status={data.status} />
          </div>
        )}

        <div className="flex items-center gap-4 p-5">
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-emerald-600 text-white shadow-lg">
            <Icon name="truck" size={24} className="invert" />
            {connected && data?.redisLive && (
              <span className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full border-2 border-card bg-emerald-500" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-bold">{data?.deliveryBoy?.name ?? "Delivery Partner"}</p>
            <p className="text-sm text-muted-foreground">
              {data?.deliveryBoy?.vehicleNo ?? "On the way"}
              {data?.distanceKm != null && ` · ${formatDistance(data.distanceKm)} away`}
            </p>
          </div>
          {data?.deliveryBoy?.phone && (
            <a
              href={`tel:${data.deliveryBoy.phone}`}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white shadow-lg transition-transform hover:scale-105"
              aria-label="Call rider"
            >
              <Icon name="phone" size={18} className="invert" />
            </a>
          )}
        </div>

        <div className="grid grid-cols-3 gap-px border-t bg-border">
          {[
            { label: "Pickup", sub: "Warehouse", icon: "cube" as const },
            { label: "Live GPS", sub: connected ? "Connected" : "Offline", icon: "bolt" as const, highlight: true },
            { label: "Drop", sub: formatDistance(data?.distanceKm), icon: "map-pin" as const },
          ].map((item) => (
            <div
              key={item.label}
              className={cn(
                "bg-card px-3 py-3 text-center",
                item.highlight && "bg-brand/5",
              )}
            >
              <Icon name={item.icon} size={16} className="mx-auto mb-1 opacity-70" />
              <p className="text-xs font-semibold">{item.label}</p>
              <p className="text-[10px] text-muted-foreground">{item.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
