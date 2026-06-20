"use client";

import { useEffect, useRef, useState } from "react";
import { RIDE_MAP_STYLES } from "./map-styles";

interface MapPoint {
  lat: number;
  lng: number;
  label: string;
  color: string;
}

interface GoogleTrackingMapProps {
  center: { lat: number; lng: number };
  points: MapPoint[];
  livePoint?: { lat: number; lng: number };
  heading?: number;
  route?: { lat: number; lng: number }[];
  geofenceCenter?: { lat: number; lng: number };
  geofenceRadiusM?: number;
  height?: number | string;
  className?: string;
}

declare global {
  interface Window {
    google?: typeof google;
    initDropMartMap?: () => void;
  }
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function getLatLng(from: { lat: number; lng: number } | google.maps.LatLng): { lat: number; lng: number } {
  if (typeof (from as google.maps.LatLng).lat === "function") {
    const ll = from as google.maps.LatLng;
    return { lat: ll.lat(), lng: ll.lng() };
  }
  return from as { lat: number; lng: number };
}

export function GoogleTrackingMap({
  center,
  points,
  livePoint,
  heading,
  route,
  geofenceCenter,
  geofenceRadiusM = 500,
  height = 420,
  className,
}: GoogleTrackingMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const liveMarkerRef = useRef<google.maps.Marker | null>(null);
  const geofenceRef = useRef<google.maps.Circle | null>(null);
  const animFrame = useRef<number | null>(null);
  const animFrom = useRef<{ lat: number; lng: number } | null>(null);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  function renderMap() {
    const g = window.google;
    const el = mapRef.current;
    if (!g?.maps || !el) return;

    if (!mapInstance.current) {
      mapInstance.current = new g.maps.Map(el, {
        center,
        zoom: 14,
        styles: RIDE_MAP_STYLES as google.maps.MapTypeStyle[],
        disableDefaultUI: true,
        zoomControl: true,
        fullscreenControl: true,
        gestureHandling: "greedy",
      });
    }

    const map = mapInstance.current;
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    points.forEach((p) => {
      markersRef.current.push(
        new g.maps.Marker({
          map,
          position: { lat: p.lat, lng: p.lng },
          title: p.label,
          label: {
            text: p.label === "Delivery" ? "🏠" : "📦",
            fontSize: "14px",
          },
          icon: {
            path: g.maps.SymbolPath.CIRCLE,
            scale: p.label === "Delivery" ? 12 : 9,
            fillColor: p.color,
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 3,
          },
        }),
      );
    });

    if (route && route.length > 1) {
      polylineRef.current?.setMap(null);
      polylineRef.current = new g.maps.Polyline({
        path: route.map((r) => ({ lat: r.lat, lng: r.lng })),
        geodesic: true,
        strokeColor: "#10b981",
        strokeOpacity: 0.85,
        strokeWeight: 5,
        map,
      });
    }

    if (geofenceCenter) {
      if (!geofenceRef.current) {
        geofenceRef.current = new g.maps.Circle({
          map,
          center: geofenceCenter,
          radius: geofenceRadiusM,
          fillColor: "#10b981",
          fillOpacity: 0.12,
          strokeColor: "#10b981",
          strokeOpacity: 0.5,
          strokeWeight: 2,
        });
      } else {
        geofenceRef.current.setCenter(geofenceCenter);
        geofenceRef.current.setRadius(geofenceRadiusM);
      }
    }

    if (livePoint) {
      const icon: google.maps.Symbol = {
        path: g.maps.SymbolPath.FORWARD_CLOSED_ARROW,
        scale: 7,
        fillColor: "#3b82f6",
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: 2,
        rotation: heading ?? 0,
      };

      if (!liveMarkerRef.current) {
        liveMarkerRef.current = new g.maps.Marker({
          map,
          position: livePoint,
          title: "Delivery Partner",
          icon,
          zIndex: 999,
        });
        animFrom.current = livePoint;
      } else {
        const fromPos = animFrom.current ?? (liveMarkerRef.current.getPosition() ? getLatLng(liveMarkerRef.current.getPosition()!) : null);
        if (fromPos && (Math.abs(fromPos.lat - livePoint.lat) > 0.00001 || Math.abs(fromPos.lng - livePoint.lng) > 0.00001)) {
          if (animFrame.current) cancelAnimationFrame(animFrame.current);
          const start = performance.now();
          const startLat = fromPos.lat;
          const startLng = fromPos.lng;

          const tick = (now: number) => {
            const t = Math.min(1, (now - start) / 800);
            const lat = lerp(startLat, livePoint.lat, t);
            const lng = lerp(startLng, livePoint.lng, t);
            liveMarkerRef.current?.setPosition({ lat, lng });
            if (heading != null) liveMarkerRef.current?.setIcon({ ...icon, rotation: heading });
            if (t < 1) animFrame.current = requestAnimationFrame(tick);
            else animFrom.current = livePoint;
          };
          animFrame.current = requestAnimationFrame(tick);
        } else {
          liveMarkerRef.current.setPosition(livePoint);
          if (heading != null) liveMarkerRef.current.setIcon({ ...icon, rotation: heading });
        }
      }
    }

    const bounds = new g.maps.LatLngBounds();
    [...points, ...(livePoint ? [livePoint] : []), ...(route ?? [])].forEach((p) =>
      bounds.extend({ lat: p.lat, lng: p.lng }),
    );
    if (!bounds.isEmpty()) map.fitBounds(bounds, 80);
  }

  useEffect(() => {
    if (!apiKey) return;
    if (window.google?.maps) {
      setReady(true);
      return;
    }
    const id = "dropmart-google-maps";
    if (document.getElementById(id)) {
      const check = setInterval(() => {
        if (window.google?.maps) {
          setReady(true);
          clearInterval(check);
        }
      }, 200);
      return () => clearInterval(check);
    }
    window.initDropMartMap = () => setReady(true);
    const script = document.createElement("script");
    script.id = id;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initDropMartMap`;
    script.async = true;
    script.onerror = () => setError("Failed to load Google Maps");
    document.head.appendChild(script);
  }, [apiKey]);

  useEffect(() => {
    if (ready) renderMap();
    return () => {
      if (animFrame.current) cancelAnimationFrame(animFrame.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, center, points, route, livePoint, heading, geofenceCenter]);

  if (!apiKey) {
    const bbox = [
      Math.min(...points.map((p) => p.lng), livePoint?.lng ?? center.lng) - 0.05,
      Math.min(...points.map((p) => p.lat), livePoint?.lat ?? center.lat) - 0.05,
      Math.max(...points.map((p) => p.lng), livePoint?.lng ?? center.lng) + 0.05,
      Math.max(...points.map((p) => p.lat), livePoint?.lat ?? center.lat) + 0.05,
    ].join("%2C");
    const marker = livePoint ? `&marker=${livePoint.lat}%2C${livePoint.lng}` : "";
    return (
      <div
        className={`relative overflow-hidden rounded-2xl border bg-slate-900 ${className ?? ""}`}
        style={{ height }}
      >
        <iframe
          title="Delivery map"
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik${marker}`}
          className="h-full w-full border-0"
          loading="lazy"
        />
        <p className="absolute bottom-3 left-3 rounded-lg bg-slate-950 px-3 py-1.5 text-xs font-medium text-white shadow-lg">
          Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY for Rapido-style live map
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`flex items-center justify-center rounded-2xl border bg-muted text-sm text-muted-foreground ${className ?? ""}`}
        style={{ height }}
      >
        {error}
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-2xl ${className ?? ""}`} style={{ height }}>
      <div ref={mapRef} className="h-full w-full" />
      {livePoint && (
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <span className="sr-only">Live rider</span>
        </div>
      )}
    </div>
  );
}
