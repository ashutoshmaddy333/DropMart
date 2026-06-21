let accessToken: string | null = null;
let csrfToken: string | null = null;

export const ACCESS_COOKIE = "dropmart_access";
export const REFRESH_COOKIE = "dropmart_refresh";
export const CSRF_COOKIE = "dropmart_csrf";
export const ROLE_COOKIE = "dropmart_role";

const SESSION_MAX_AGE = 7 * 24 * 60 * 60;

function cookieFlags(): string {
  const secure = typeof window !== "undefined" && window.location.protocol === "https:";
  return `path=/; SameSite=Lax${secure ? "; Secure" : ""}`;
}

function setCookie(name: string, value: string, maxAgeSeconds: number) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${maxAgeSeconds}; ${cookieFlags()}`;
}

function deleteCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; max-age=0; ${cookieFlags()}`;
}

/** Mirror auth cookies on the frontend domain so Next.js middleware can read them. */
export function setClientAuthCookies(tokens: {
  accessToken?: string | null;
  csrfToken?: string | null;
  role?: string | null;
}) {
  if (tokens.accessToken) {
    setCookie(ACCESS_COOKIE, tokens.accessToken, SESSION_MAX_AGE);
    setCookie(REFRESH_COOKIE, "1", SESSION_MAX_AGE);
  }
  if (tokens.csrfToken) {
    setCookie(CSRF_COOKIE, tokens.csrfToken, SESSION_MAX_AGE);
  }
  if (tokens.role) {
    setCookie(ROLE_COOKIE, tokens.role, SESSION_MAX_AGE);
  }
}

export function clearClientAuthCookies() {
  deleteCookie(ACCESS_COOKIE);
  deleteCookie(REFRESH_COOKIE);
  deleteCookie(CSRF_COOKIE);
  deleteCookie(ROLE_COOKIE);
}

export function setAuthSession(tokens: {
  accessToken?: string | null;
  csrfToken?: string | null;
  role?: string | null;
}) {
  if (tokens.accessToken !== undefined) accessToken = tokens.accessToken;
  if (tokens.csrfToken !== undefined) csrfToken = tokens.csrfToken;
  setClientAuthCookies(tokens);
}

export function clearAuthSession() {
  accessToken = null;
  csrfToken = null;
  clearClientAuthCookies();
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
