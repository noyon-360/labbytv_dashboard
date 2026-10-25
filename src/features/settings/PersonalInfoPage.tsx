"use client";

import { KeyRound, SquarePen } from "lucide-react";
import { useProfile } from "@/api/profile";
import { Avatar } from "@/components/ui/Avatar";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorState, Skeleton } from "@/components/ui/States";
import { PageHeader } from "@/layout/PageHeader";
import { displayName } from "@/lib/format";

/** Read-only field styled like the Figma form (value in a disabled-looking box). */
function ReadOnlyField({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-fg-2">{label}</span>
      <div className="flex h-10 items-center truncate rounded-lg border border-line bg-field px-3 text-base text-fg-2">
        {value || <span className="text-subtle">Not set</span>}
      </div>
    </div>
  );
}

export function PersonalInfoPage() {
  const { data: profile, isPending, isError, error, refetch } = useProfile();
  const crumbs = [{ label: "Dashboard", href: "/dashboard" }, { label: "Personal Information" }];

  return (
    <>
      <PageHeader
        title="Personal Information"
        crumbs={crumbs}
        actions={
          <>
            <ButtonLink href="/settings/password" variant="secondary" icon={<KeyRound className="size-5" />}>
              Change Password
            </ButtonLink>
            <ButtonLink href="/settings/edit" icon={<SquarePen className="size-5" />}>
              Edit
            </ButtonLink>
          </>
        }
      />
      {isError ? (
        <Card>
          <ErrorState title="Couldn't load your profile" error={error} onRetry={() => refetch()} />
        </Card>
      ) : isPending ? (
        <Card className="space-y-5 p-6">
          <Skeleton className="size-16" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </Card>
      ) : (
        <ProfileCard profile={profile} />
      )}
    </>
  );
}

function ProfileCard({ profile }: { profile: NonNullable<ReturnType<typeof useProfile>["data"]> }) {
  const name = displayName(profile);
  return (
    <Card className="p-5 sm:p-6">
      <div className="mb-6 flex items-center gap-5">
        <Avatar name={name} src={profile.avatar?.url} size={64} />
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold">{name}</p>
          <p className="text-sm text-muted">Admin</p>
        </div>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <ReadOnlyField label="Name" value={profile.name} />
        <ReadOnlyField label="Email" value={profile.email} />
      </div>
    </Card>
  );
}
