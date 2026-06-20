let accessToken: string | null = null;
let csrfToken: string | null = null;

export function setAuthSession(tokens: { accessToken?: string | null; csrfToken?: string | null }) {
  if (tokens.accessToken !== undefined) accessToken = tokens.accessToken;
  if (tokens.csrfToken !== undefined) csrfToken = tokens.csrfToken;
}

export function clearAuthSession() {
  accessToken = null;
  csrfToken = null;
}

export function getStoredAccessToken() {
  return accessToken;
}

export function getCsrfFromCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)dropmart_csrf=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function getStoredCsrfToken() {
  return csrfToken ?? getCsrfFromCookie();
}
