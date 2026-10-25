"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save } from "lucide-react";
import { changePassword } from "@/api/auth";
import { getErrorMessage } from "@/api/client";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PasswordInput } from "@/components/ui/Field";
import { Alert } from "@/components/ui/States";
import { useToast } from "@/components/ui/Toast";
import { PageHeader } from "@/layout/PageHeader";
import { mismatch, passwordFields, passwordsMatch } from "@/lib/passwords";

const schema = z
  .object({ oldPassword: z.string().min(1, "Enter your current password"), ...passwordFields })
  .refine(passwordsMatch, mismatch)
  .refine((v) => v.oldPassword !== v.newPassword, {
    path: ["newPassword"],
    message: "Choose a password different from the current one",
  });
type Values = z.infer<typeof schema>;

export function ChangePasswordPage() {
  const toast = useToast();
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async ({ oldPassword, newPassword }) => {
    setError("");
    try {
      await changePassword(oldPassword, newPassword);
      reset({ oldPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Password changed");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  });

  return (
    <>
      <PageHeader
        title="Change Password"
        crumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Personal Information", href: "/settings" },
          { label: "Change Password" },
        ]}
      />
      <Card className="max-w-[640px] p-5 sm:p-6">
        {error && (
          <Alert tone="danger" className="mb-6">
            {error}
          </Alert>
        )}
        <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
          <PasswordInput label="Current password" autoComplete="current-password" error={errors.oldPassword?.message} {...register("oldPassword")} />
          <PasswordInput label="New password" autoComplete="new-password" placeholder="At least 8 characters" error={errors.newPassword?.message} {...register("newPassword")} />
          <PasswordInput label="Repeat new password" autoComplete="new-password" error={errors.confirmPassword?.message} {...register("confirmPassword")} />
          <div className="mt-2 flex justify-end">
            <Button type="submit" loading={isSubmitting} icon={<Save className="size-5" />}>
              Save Password
            </Button>
          </div>
        </form>
      </Card>
    </>
  );
}
