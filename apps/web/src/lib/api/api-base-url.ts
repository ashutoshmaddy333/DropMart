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
