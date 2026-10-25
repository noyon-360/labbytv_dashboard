"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getErrorStatus, refreshAccessToken } from "@/api/client";
import * as authApi from "@/api/auth";
import { fetchProfile, profileKey } from "@/api/profile";
import { session } from "./session";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated" | "offline";

type AuthContextValue = {
  status: AuthStatus;
  /** True after a session ended on its own (refresh failed), so login can say so. */
  expired: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  retry: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export class NotAdminError extends Error {
  constructor() {
    super("This account doesn't have admin access. Sign in with an admin account.");
    this.name = "NotAdminError";
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [expired, setExpired] = useState(false);
  const [attempt, setAttempt] = useState(0);

  // Restore the session from the stored refresh token.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!session.getRefreshToken()) {
        setStatus("unauthenticated");
        return;
      }
      try {
        await refreshAccessToken();
        const profile = await fetchProfile();
        if (cancelled) return;
        if (profile.role !== "admin") {
          session.clear();
          setStatus("unauthenticated");
          return;
        }
        queryClient.setQueryData(profileKey, profile);
        setStatus("authenticated");
      } catch (err) {
        if (cancelled) return;
        // No response at all means we couldn't reach the API; keep the token and offer a retry.
        setStatus(getErrorStatus(err) || !session.getRefreshToken() ? "unauthenticated" : "offline");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [attempt, queryClient]);

  useEffect(
    () =>
      session.onExpired(() => {
        queryClient.clear();
        setExpired(true);
        setStatus("unauthenticated");
      }),
    [queryClient],
  );

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await authApi.login(email, password);
      if (result.role !== "admin") throw new NotAdminError(); // tokens are dropped, never stored
      session.setTokens(result);
      // The login response's `user` carries server-only fields, so load the profile instead.
      try {
        queryClient.setQueryData(profileKey, await fetchProfile());
      } catch (err) {
        session.clear();
        throw err;
      }
      setExpired(false);
      setStatus("authenticated");
    },
    [queryClient],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Signing out locally still matters if the server call fails.
    }
    session.clear();
    queryClient.clear();
    setExpired(false);
    setStatus("unauthenticated");
  }, [queryClient]);

  const retry = useCallback(() => {
    setStatus("loading");
    setAttempt((n) => n + 1);
  }, []);

  const value = useMemo(() => ({ status, expired, login, logout, retry }), [status, expired, login, logout, retry]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
