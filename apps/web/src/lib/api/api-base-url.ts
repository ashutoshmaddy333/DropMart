/** Backend origin for server-side fetches and Next.js rewrites. */
export function getApiProxyUrl(): string {
  if (process.env.API_PROXY_URL) {
    return process.env.API_PROXY_URL.replace(/\/$/, "");
  }

  const publicUrl = process.env.NEXT_PUBLIC_API_URL;
  if (publicUrl?.startsWith("http")) {
    return publicUrl.replace(/\/api\/v1\/?$/, "");
  }

  return "http://localhost:4000";
}

export function getServerApiBase(): string {
  return `${getApiProxyUrl()}/api/v1`;
}

/** Browser REST base (relative in local dev, full URL in production). */
export function getClientApiBase(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? "/api/v1";
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
