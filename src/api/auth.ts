import { api, unwrap } from "./client";
import type { ApiResponse, LoginResult } from "@/types/api";

// No deviceId: that is for the mobile app's single-device rule.
export const login = (email: string, password: string) =>
  unwrap(api.post<ApiResponse<LoginResult>>("/auth/login", { email, password }));

export const logout = () => api.post("/auth/logout");

/** Emails a 6-digit code. Also used for "Resend code". */
export const forgotPassword = (email: string) => api.post("/auth/forget", { email });

// /auth/verify is broken on the backend; the code is checked here instead.
export const resetPassword = (email: string, otp: string, password: string) =>
  api.post("/auth/reset-password", { email, otp: String(otp), password });

export const changePassword = (oldPassword: string, newPassword: string) =>
  api.post("/auth/change-password", { oldPassword, newPassword });
