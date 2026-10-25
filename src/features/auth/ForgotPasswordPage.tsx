"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { ArrowLeft, Mail } from "lucide-react";
import { forgotPassword } from "@/api/auth";
import { getErrorMessage } from "@/api/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { Alert } from "@/components/ui/States";
import { maskEmail } from "@/lib/format";
import { AuthHeading } from "./AuthLayout";
import { useResetFlow } from "./ResetFlow";

const schema = z.object({ email: z.email("Enter a valid email address") });
type Values = z.infer<typeof schema>;

export function ForgotPasswordPage() {
  const router = useRouter();
  const flow = useResetFlow();
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { email: flow.email } });

  const email = (useWatch({ control, name: "email" }) ?? "").trim();
  const valid = schema.safeParse({ email }).success;

  const onSubmit = handleSubmit(async ({ email }) => {
    setError("");
    const normalized = email.trim().toLowerCase();
    try {
      await forgotPassword(normalized);
      flow.setEmail(normalized);
      flow.setOtp("");
      flow.setOtpError("");
      router.push("/verify-otp");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  });

  return (
    <>
      <AuthHeading title="Forgot Password" subtitle="We'll send a 6-digit code to reset your password." />
      {error && (
        <Alert tone="danger" className="mb-6">
          {error}
        </Alert>
      )}
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
        <Input label="Email" type="email" autoComplete="email" placeholder="admin@labbytv.com" error={errors.email?.message} {...register("email")} />

        <div
          className={`flex items-center gap-4 rounded-xl border p-4 transition-colors ${valid ? "border-brand" : "border-line"}`}
          aria-live="polite"
        >
          <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-white/10">
            <Mail className="size-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-sm text-muted">via Email</p>
            <p className="truncate text-base font-medium">{valid ? maskEmail(email) : "Enter your email above"}</p>
          </div>
        </div>

        <Button type="submit" loading={isSubmitting} className="mt-2 w-full">
          Continue
        </Button>
        <Link href="/login" className="mx-auto inline-flex items-center gap-2 rounded text-sm text-fg-2 hover:text-fg focus-visible:outline-2 focus-visible:outline-brand">
          <ArrowLeft className="size-4" aria-hidden /> Back to login
        </Link>
      </form>
    </>
  );
}
