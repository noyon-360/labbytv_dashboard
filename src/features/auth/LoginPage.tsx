"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useAuth } from "@/auth/AuthProvider";
import { getErrorMessage } from "@/api/client";
import { Button } from "@/components/ui/Button";
import { Input, PasswordInput } from "@/components/ui/Field";
import { Alert } from "@/components/ui/States";
import { AuthHeading } from "./AuthLayout";
import { useResetFlow } from "./ResetFlow";

const schema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});
type Values = z.infer<typeof schema>;

export function LoginPage() {
  const { login, expired } = useAuth();
  const flow = useResetFlow();
  const params = useSearchParams();
  const [error, setError] = useState("");
  const notice = params.get("reset")
    ? { tone: "success" as const, text: "Password updated. Sign in with your new password." }
    : expired || params.get("expired")
      ? { tone: "info" as const, text: "Your session has expired. Sign in again to keep working." }
      : null;

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { email: flow.email, password: "" } });

  const onSubmit = handleSubmit(async ({ email, password }) => {
    setError("");
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  });

  return (
    <>
      <AuthHeading title="Login" subtitle="Sign in to the LABBY TV admin dashboard." />
      {notice && !error && (
        <Alert tone={notice.tone} className="mb-6">
          {notice.text}
        </Alert>
      )}
      {error && (
        <Alert tone="danger" className="mb-6">
          {error}
        </Alert>
      )}
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-6">
        <Input label="Email" type="email" autoComplete="username" placeholder="admin@labbytv.com" error={errors.email?.message} {...register("email")} />
        <div>
          <PasswordInput label="Password" autoComplete="current-password" placeholder="Enter your password" error={errors.password?.message} {...register("password")} />
          <div className="mt-3 flex justify-end">
            <Link
              href="/forgot-password"
              onClick={() => flow.setEmail(getValues("email").trim())}
              className="rounded text-sm text-fg-2 underline-offset-4 hover:text-fg hover:underline focus-visible:outline-2 focus-visible:outline-brand"
            >
              Forgot Password?
            </Link>
          </div>
        </div>
        <Button type="submit" loading={isSubmitting} className="mt-2 w-full">
          Login
        </Button>
      </form>
    </>
  );
}
