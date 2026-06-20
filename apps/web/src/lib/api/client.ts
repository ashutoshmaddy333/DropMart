import {
  clearAuthSession,
  getCsrfFromCookie,
  getStoredAccessToken,
  getStoredCsrfToken,
  setAuthSession,
} from "./auth-session";
import { getClientApiBase } from "./api-base-url";

const API_BASE = getClientApiBase();

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function getCsrfToken(): string | null {
  return getStoredCsrfToken();
}

let refreshPromise: Promise<boolean> | null = null;

async function tryRefreshTokens(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) return false;
      const data = await res.json() as { accessToken?: string; csrfToken?: string };
      setAuthSession({ accessToken: data.accessToken, csrfToken: data.csrfToken });
      return true;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string | null; skipCsrf?: boolean; _retry?: boolean } = {},
): Promise<T> {
  const { token, skipCsrf, _retry, ...init } = options;
  const method = (init.method ?? "GET").toUpperCase();
  const isMutating = ["POST", "PUT", "PATCH", "DELETE"].includes(method);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };

  const authToken = token ?? getStoredAccessToken();
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  if (isMutating && !skipCsrf) {
    const csrf = getStoredCsrfToken() ?? getCsrfFromCookie();
    if (csrf) {
      headers["X-CSRF-Token"] = csrf;
      headers["X-XSRF-Token"] = csrf;
    }
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
    credentials: "include",
  });

  if (res.status === 401 && !_retry && !path.includes("/auth/login") && !path.includes("/auth/refresh")) {
    const refreshed = await tryRefreshTokens();
    if (refreshed) {
      return apiFetch<T>(path, { ...options, _retry: true });
    }
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new ApiError(res.status, body.message ?? "Request failed");
  }

  return res.json() as Promise<T>;
}

export { API_BASE, setAuthSession, clearAuthSession };
