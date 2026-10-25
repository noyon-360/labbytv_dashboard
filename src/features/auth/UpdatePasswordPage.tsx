"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPassword } from "@/api/auth";
import { getErrorMessage, getErrorStatus } from "@/api/client";
import { Button } from "@/components/ui/Button";
import { PasswordInput } from "@/components/ui/Field";
import { Alert } from "@/components/ui/States";
import { newPasswordSchema, type NewPasswordValues } from "@/lib/passwords";
import { AuthHeading } from "./AuthLayout";
import { useResetFlow } from "./ResetFlow";

export function UpdatePasswordPage() {
  const router = useRouter();
  const flow = useResetFlow();
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NewPasswordValues>({ resolver: zodResolver(newPasswordSchema) });

  // Set once the reset succeeds, so clearing the code doesn't trigger the guard below.
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (done) return;
    if (!flow.email) router.replace("/forgot-password");
    else if (!flow.otp) router.replace("/verify-otp");
  }, [done, flow.email, flow.otp, router]);

  const onSubmit = handleSubmit(async ({ newPassword }) => {
    setError("");
    try {
      await resetPassword(flow.email, flow.otp, newPassword);
      setDone(true);
      flow.setOtp("");
      router.replace("/login?reset=1");
    } catch (err) {
      const message = getErrorMessage(err);
      // A wrong or expired code is a 400: go back to the code step and say why.
      if (getErrorStatus(err) === 400) {
        flow.setOtpError(message);
        flow.setOtp("");
        router.replace("/verify-otp");
        return;
      }
      setError(message);
    }
  });

  return (
    <>
      <AuthHeading title="Update Password" subtitle="Choose a new password for your admin account." />
      {error && (
        <Alert tone="danger" className="mb-6">
          {error}
        </Alert>
      )}
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
        <PasswordInput label="New password" autoComplete="new-password" placeholder="At least 8 characters" error={errors.newPassword?.message} {...register("newPassword")} />
        <PasswordInput label="Repeat password" autoComplete="new-password" placeholder="Type it again" error={errors.confirmPassword?.message} {...register("confirmPassword")} />
        <Button type="submit" loading={isSubmitting} className="mt-2 w-full">
          Continue
        </Button>
      </form>
    </>
  );
}
