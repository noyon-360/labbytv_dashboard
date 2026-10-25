import type { TokenPair } from "@/types/api";

// The access token lives only in memory. The refresh token is in localStorage
// so a reload can restore the session through /auth/refresh-token.
const REFRESH_KEY = "labbytv.admin.refreshToken";

let accessToken: string | null = null;
const expiredListeners = new Set<() => void>();

function storage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

export const session = {
  getAccessToken: () => accessToken,

  getRefreshToken: () => storage()?.getItem(REFRESH_KEY) ?? null,

  setTokens(tokens: TokenPair) {
    accessToken = tokens.accessToken;
    storage()?.setItem(REFRESH_KEY, tokens.refreshToken);
  },

  clear() {
    accessToken = null;
    storage()?.removeItem(REFRESH_KEY);
  },

  /** Called when a refresh fails: the session is gone and the user must sign in again. */
  expire() {
    session.clear();
    expiredListeners.forEach((fn) => fn());
  },

  onExpired(fn: () => void) {
    expiredListeners.add(fn);
    return () => {
      expiredListeners.delete(fn);
    };
  },
};
