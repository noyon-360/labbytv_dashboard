import axios, { isAxiosError, type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { API_BASE_URL } from "@/lib/env";
import { session } from "@/auth/session";
import type { ApiErrorBody, ApiResponse, TokenPair } from "@/types/api";

export const api = axios.create({ baseURL: API_BASE_URL, timeout: 30_000 });

// Endpoints that must never trigger a refresh-and-retry.
const NO_REFRESH = ["/auth/login", "/auth/refresh-token", "/auth/forget", "/auth/reset-password"];

api.interceptors.request.use((config) => {
  const token = session.getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let inflight: Promise<string> | null = null;

/**
 * Exchanges the stored refresh token for a new pair. Concurrent callers share one
 * request. The backend keeps a single refresh token per user and rotates it on every
 * call, so the exchange is also serialized across tabs with a Web Lock; each tab reads
 * the latest token from storage inside the lock.
 */
export function refreshAccessToken(): Promise<string> {
  inflight ??= withLock(async () => {
    const refreshToken = session.getRefreshToken();
    if (!refreshToken) {
      session.expire();
      throw new Error("No session");
    }
    try {
      const res = await axios.post<ApiResponse<TokenPair>>(
        `${API_BASE_URL}/auth/refresh-token`,
        { refreshToken },
        { timeout: 30_000 },
      );
      session.setTokens(res.data.data);
      return res.data.data.accessToken;
    } catch (err) {
      // The server rejected the token: the session is over. A network error leaves
      // the session in place so the caller can retry.
      if (isAxiosError(err) && err.response) session.expire();
      throw err;
    }
  }).finally(() => {
    inflight = null;
  });
  return inflight;
}

function withLock<T>(fn: () => Promise<T>): Promise<T> {
  if (typeof navigator !== "undefined" && navigator.locks) {
    return navigator.locks.request("labbytv-admin-refresh", fn) as Promise<T>;
  }
  return fn();
}

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

api.interceptors.response.use(undefined, async (error: AxiosError) => {
  const config = error.config as RetriableConfig | undefined;
  const isAuthCall = NO_REFRESH.some((path) => config?.url?.startsWith(path));
  if (error.response?.status === 401 && config && !config._retried && !isAuthCall) {
    config._retried = true;
    const token = await refreshAccessToken();
    config.headers.Authorization = `Bearer ${token}`;
    return api(config);
  }
  throw error;
});

/** The human-readable message for any error thrown by an API call. */
export function getErrorMessage(error: unknown, fallback = "Something went wrong. Try again."): string {
  if (isAxiosError<ApiErrorBody>(error)) {
    if (error.response?.data?.message) return error.response.data.message;
    if (!error.response) return "Couldn't reach the server. Check your connection and try again.";
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function getErrorStatus(error: unknown): number | undefined {
  return isAxiosError(error) ? error.response?.status : undefined;
}

/** Unwraps `{ success, message, data }`. */
export async function unwrap<T>(request: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const res = await request;
  return res.data.data;
}
