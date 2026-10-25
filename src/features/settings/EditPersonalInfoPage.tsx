"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Camera, Save } from "lucide-react";
import { getErrorMessage } from "@/api/client";
import { useProfile, useUpdateProfile } from "@/api/profile";
import { Avatar } from "@/components/ui/Avatar";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Field";
import { Alert, ErrorState, Skeleton } from "@/components/ui/States";
import { useToast } from "@/components/ui/Toast";
import { PageHeader } from "@/layout/PageHeader";
import { displayName } from "@/lib/format";
import type { User } from "@/types/api";

const MAX_AVATAR_BYTES = 10 * 1024 * 1024;
const AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

const schema = z.object({
  name: z.string().trim().min(1, "Add a name").max(120),
});
type Values = z.infer<typeof schema>;

const crumbs = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Personal Information", href: "/settings" },
  { label: "Edit" },
];

export function EditPersonalInfoPage() {
  const { data: profile, isPending, isError, error, refetch } = useProfile();
  if (isError) {
    return (
      <>
        <PageHeader title="Edit Personal Information" crumbs={crumbs} />
        <Card>
          <ErrorState title="Couldn't load your profile" error={error} onRetry={() => refetch()} />
        </Card>
      </>
    );
  }
  if (isPending) {
    return (
      <>
        <PageHeader title="Edit Personal Information" crumbs={crumbs} />
        <Card className="space-y-5 p-6">
          <Skeleton className="size-16" />
          <Skeleton className="h-12 w-full" />
        </Card>
      </>
    );
  }
  return <EditForm key={profile.updatedAt} profile={profile} />;
}

function EditForm({ profile }: { profile: User }) {
  const router = useRouter();
  const toast = useToast();
  const update = useUpdateProfile();
  const fileInput = useRef<HTMLInputElement>(null);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>();
  const [avatarError, setAvatarError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: profile.name ?? "" },
  });

  // Release the preview's object URL when it's replaced or the form goes away.
  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview);
  }, [preview]);

  const pickAvatar = (file?: File) => {
    setAvatarError("");
    if (!file) return;
    if (!AVATAR_TYPES.includes(file.type)) return setAvatarError("Use a JPEG, PNG, WEBP or HEIC image.");
    if (file.size > MAX_AVATAR_BYTES) return setAvatarError("Image is too large. Maximum size is 10MB.");
    setAvatar(file);
    setPreview(URL.createObjectURL(file));
  };

  const onSubmit = handleSubmit(async (v) => {
    try {
      await update.mutateAsync({
        name: v.name,
        avatar,
      });
      toast.success("Profile updated");
      router.push("/settings");
    } catch {
      // shown inline
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate>
      <PageHeader
        title="Edit Personal Information"
        crumbs={crumbs}
        actions={
          <>
            <ButtonLink href="/settings" variant="secondary">
              Cancel
            </ButtonLink>
            <Button type="submit" loading={isSubmitting} disabled={!isDirty && !avatar} icon={<Save className="size-5" />}>
              Save
            </Button>
          </>
        }
      />
      {update.isError && (
        <Alert tone="danger" className="mb-6">
          {getErrorMessage(update.error)}
        </Alert>
      )}
      <Card className="p-5 sm:p-6">
        <div className="mb-6 flex flex-wrap items-center gap-5">
          <Avatar name={displayName(profile)} src={preview ?? profile.avatar?.url} size={64} />
          <div>
            <input
              ref={fileInput}
              type="file"
              accept={AVATAR_TYPES.join(",")}
              className="sr-only"
              onChange={(e) => pickAvatar(e.target.files?.[0])}
              aria-label="Choose a profile photo"
            />
            <Button variant="secondary" size="sm" onClick={() => fileInput.current?.click()} icon={<Camera className="size-4" />}>
              {avatar ? "Choose another photo" : "Change photo"}
            </Button>
            <p className={avatarError ? "mt-2 text-xs text-danger-fg" : "mt-2 text-xs text-subtle"} role={avatarError ? "alert" : undefined}>
              {avatarError || "JPEG, PNG, WEBP or HEIC, up to 10MB."}
            </p>
          </div>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <Input label="Name" autoComplete="name" error={errors.name?.message} {...register("name")} />
          <Input label="Email" value={profile.email} disabled readOnly hint="Email can't be changed." />
        </div>
      </Card>
    </form>
  );
}
