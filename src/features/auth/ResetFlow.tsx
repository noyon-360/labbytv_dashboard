"use client";

import { createContext, useContext, useMemo, useState } from "react";

// State carried across Forgot Password -> Verify OTP -> Update Password.
// The code is only checked by /auth/reset-password at the last step.
type ResetFlow = {
  email: string;
  otp: string;
  /** Error from the last step, shown back on the OTP screen (e.g. "Invalid OTP"). */
  otpError: string;
  setEmail: (email: string) => void;
  setOtp: (otp: string) => void;
  setOtpError: (message: string) => void;
  reset: () => void;
};

const ResetFlowContext = createContext<ResetFlow | null>(null);

export function ResetFlowProvider({ children }: { children: React.ReactNode }) {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const value = useMemo(
    () => ({
      email,
      otp,
      otpError,
      setEmail,
      setOtp,
      setOtpError,
      reset: () => {
        setEmail("");
        setOtp("");
        setOtpError("");
      },
    }),
    [email, otp, otpError],
  );
  return <ResetFlowContext.Provider value={value}>{children}</ResetFlowContext.Provider>;
}

export function useResetFlow() {
  const ctx = useContext(ResetFlowContext);
  if (!ctx) throw new Error("useResetFlow must be used inside ResetFlowProvider");
  return ctx;
}
