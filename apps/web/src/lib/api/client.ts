import {
  clearAuthSession,
  getCsrfFromCookie,
  getStoredAccessToken,
  getStoredCsrfToken,
  setAuthSession,
} from "./auth-session";
import { getClientApiBase } from "./api-base-url";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public retryAfter?: number,
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
      const res = await fetch(`${getClientApiBase()}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) return false;
      const data = await res.json() as {
        accessToken?: string;
        csrfToken?: string;
        user?: { role?: string };
      };
      setAuthSession({
        accessToken: data.accessToken,
        csrfToken: data.csrfToken,
        role: data.user?.role,
      });
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
  options: RequestInit & {
    token?: string | null;
    skipCsrf?: boolean;
    _retry?: boolean;
    timeoutMs?: number;
  } = {},
): Promise<T> {
  const { token, skipCsrf, _retry, timeoutMs = 0, ...init } = options;
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

  const controller = timeoutMs > 0 ? new AbortController() : null;
  const timer =
    controller && timeoutMs > 0
      ? setTimeout(() => controller.abort(), timeoutMs)
      : null;

  let res: Response;
  try {
    res = await fetch(`${getClientApiBase()}${path}`, {
      ...init,
      headers,
      credentials: "include",
      signal: controller?.signal,
    });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new ApiError(
        408,
        "Request timed out — the server may be waking up. Wait a moment and tap Resend.",
      );
    }
    throw err;
  } finally {
    if (timer) clearTimeout(timer);
  }

  if (res.status === 401 && !_retry && !path.includes("/auth/login") && !path.includes("/auth/refresh")) {
    const refreshed = await tryRefreshTokens();
    if (refreshed) {
      return apiFetch<T>(path, { ...options, _retry: true });
    }
  }

  if (!res.ok) {
    const body = (await res.json().catch(() => ({ message: res.statusText }))) as {
      message?: string | string[];
      retryAfter?: number;
    };
    const message = Array.isArray(body.message)
      ? body.message.join(", ")
      : (body.message ?? res.statusText);
    const retryMatch = typeof message === "string" ? message.match(/wait (\d+)s/i) : null;
    const retryAfter =
      body.retryAfter ?? (retryMatch ? Number(retryMatch[1]) : undefined);
    throw new ApiError(res.status, message, retryAfter);
  }

  const text = await res.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new ApiError(
      502,
      "Invalid API response — the server may be waking up. Please try again in a moment.",
    );
  }
}

export { getClientApiBase as API_BASE, setAuthSession, clearAuthSession };
