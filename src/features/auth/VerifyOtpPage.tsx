"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { forgotPassword } from "@/api/auth";
import { getErrorMessage } from "@/api/client";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/States";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/cn";
import { maskEmail } from "@/lib/format";
import { AuthHeading } from "./AuthLayout";
import { useResetFlow } from "./ResetFlow";

const LENGTH = 6;
const RESEND_SECONDS = 60;

export function VerifyOtpPage() {
  const router = useRouter();
  const toast = useToast();
  const flow = useResetFlow();
  const [digits, setDigits] = useState<string[]>(() => {
    const prev = flow.otp.split("").slice(0, LENGTH);
    return Array.from({ length: LENGTH }, (_, i) => prev[i] ?? "");
  });
  const [localError, setLocalError] = useState("");
  // An error can also come back from the Update Password step (wrong or expired code).
  const error = localError || flow.otpError;
  const setError = (message: string) => {
    setLocalError(message);
    if (!message) flow.setOtpError("");
  };
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [resending, setResending] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  // Without an email there's nothing to verify (e.g. after a reload).
  useEffect(() => {
    if (!flow.email) router.replace("/forgot-password");
  }, [flow.email, router]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft]);

  const fill = (start: number, value: string) => {
    const chars = value.replace(/\D/g, "").split("");
    if (chars.length === 0) return;
    setDigits((prev) => {
      const next = [...prev];
      chars.slice(0, LENGTH - start).forEach((c, i) => (next[start + i] = c));
      return next;
    });
    inputs.current[Math.min(start + chars.length, LENGTH - 1)]?.focus();
  };

  const onKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      e.preventDefault();
      setDigits((prev) => prev.map((d, j) => (j === i - 1 ? "" : d)));
      inputs.current[i - 1]?.focus();
    } else if (e.key === "ArrowLeft" && i > 0) {
      inputs.current[i - 1]?.focus();
    } else if (e.key === "ArrowRight" && i < LENGTH - 1) {
      inputs.current[i + 1]?.focus();
    }
  };

  const code = digits.join("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== LENGTH) {
      setError("Enter the 6-digit code from the email.");
      return;
    }
    flow.setOtp(code);
    setError("");
    router.push("/reset-password");
  };

  const resend = async () => {
    setResending(true);
    setError("");
    try {
      await forgotPassword(flow.email);
      setDigits(Array(LENGTH).fill(""));
      setSecondsLeft(RESEND_SECONDS);
      toast.success("A new code is on its way.");
      inputs.current[0]?.focus();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setResending(false);
    }
  };

  return (
    <>
      <AuthHeading
        title="Verify OTP"
        subtitle={
          <>
            Enter the 6-digit code we sent to <span className="font-medium text-fg">{maskEmail(flow.email)}</span>.
          </>
        }
      />
      {error && (
        <Alert tone="danger" className="mb-6">
          {error}
        </Alert>
      )}
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
        <fieldset>
          <legend className="sr-only">Verification code</legend>
          <div className="flex justify-between gap-2 sm:gap-3">
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => {
                  inputs.current[i] = el;
                }}
                value={d}
                inputMode="numeric"
                autoComplete={i === 0 ? "one-time-code" : "off"}
                maxLength={LENGTH}
                aria-label={`Digit ${i + 1}`}
                autoFocus={i === 0}
                onChange={(e) => {
                  const v = e.target.value;
                  if (error) setError("");
                  if (v === "") setDigits((prev) => prev.map((x, j) => (j === i ? "" : x)));
                  // One new digit typed beside the existing one: keep the new one.
                  else if (v.length === 2 && d) fill(i, v[0] === d ? v[1] : v[0]);
                  // Otherwise a full code (autofill) or a single digit.
                  else fill(i, v);
                }}
                onPaste={(e) => {
                  e.preventDefault();
                  fill(i, e.clipboardData.getData("text"));
                }}
                onKeyDown={(e) => onKeyDown(i, e)}
                onFocus={(e) => e.target.select()}
                className={cn(
                  "aspect-square w-full max-w-12 min-w-0 rounded-lg border bg-transparent text-center text-xl font-semibold tabular-nums",
                  "focus:border-brand focus:outline-none",
                  error ? "border-danger" : "border-line-input",
                )}
              />
            ))}
          </div>
        </fieldset>

        <p className="text-center text-sm text-fg-2" aria-live="polite">
          {secondsLeft > 0 ? (
            <>
              Resend code in <span className="tabular-nums">{secondsLeft}s</span>
            </>
          ) : (
            <button
              type="button"
              onClick={resend}
              disabled={resending}
              className="rounded font-medium text-brand-fg hover:underline focus-visible:outline-2 focus-visible:outline-brand disabled:opacity-50"
            >
              {resending ? "Sending…" : "Resend code"}
            </button>
          )}
        </p>

        <Button type="submit" className="w-full">
          Verify
        </Button>
        <Link href="/forgot-password" className="mx-auto inline-flex items-center gap-2 rounded text-sm text-fg-2 hover:text-fg focus-visible:outline-2 focus-visible:outline-brand">
          <ArrowLeft className="size-4" aria-hidden /> Use a different email
        </Link>
      </form>
    </>
  );
}
