export const PRODUCTION_API_ORIGIN = "https://dropmart-7umo.onrender.com";

/** Backend origin for server-side fetches and Next.js rewrites. */
export function getApiProxyUrl(): string {
  if (process.env.API_PROXY_URL) {
    return process.env.API_PROXY_URL.replace(/\/$/, "");
  }

  const publicUrl = process.env.NEXT_PUBLIC_API_URL;
  if (publicUrl?.startsWith("http")) {
    return publicUrl.replace(/\/api\/v1\/?$/, "");
  }

  const isDeployed =
    process.env.VERCEL === "1" ||
    process.env.NODE_ENV === "production";

  if (isDeployed) {
    return PRODUCTION_API_ORIGIN;
  }

  return "http://localhost:4000";
}

export function getServerApiBase(): string {
  return `${getApiProxyUrl()}/api/v1`;
}

/** Browser REST base — production uses Render directly; local dev uses `/api/v1` proxy. */
export function getClientApiBase(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

  const isDeployed =
    typeof window === "undefined"
      ? process.env.VERCEL === "1" || process.env.NODE_ENV === "production"
      : !window.location.hostname.includes("localhost");

  if (isDeployed) {
    if (configured?.startsWith("http")) return configured;
    return `${PRODUCTION_API_ORIGIN}/api/v1`;
  }

  return configured?.startsWith("/") ? configured : "/api/v1";
}

/** Socket.io server origin — must be the Render API host in production. */
export function getRealtimeUrl(): string {
  if (process.env.NEXT_PUBLIC_WS_URL) {
    return process.env.NEXT_PUBLIC_WS_URL.replace(/\/$/, "");
  }

  const apiBase = getClientApiBase();
  if (apiBase.startsWith("http")) {
    return apiBase.replace(/\/api\/v1\/?$/, "");
  }

  return getApiProxyUrl();
}

/** Server-side fetch timeout (Vercel hobby limit ~10s; allow headroom for warm API). */
export const SERVER_FETCH_TIMEOUT_MS = 25_000;
