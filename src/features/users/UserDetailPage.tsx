"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  Calendar,
  CircleUser,
  Crown,
  Inbox,
  Mail,
  Phone,
  Smartphone,
  SquarePen,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { getErrorStatus } from "@/api/client";
import { useProfile } from "@/api/profile";
import { useUser } from "@/api/users";
import { Avatar } from "@/components/ui/Avatar";
import { PlanBadge, StatusBadge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card, CardTitle, Detail } from "@/components/ui/Card";
import { ErrorState, Skeleton } from "@/components/ui/States";
import { PageHeader } from "@/layout/PageHeader";
import {
  describeDevices,
  displayName,
  formatDate,
  PLAN_LABEL,
  PLATFORM_LABEL,
  relativeDays,
  STATUS_LABEL,
} from "@/lib/format";
import { hasLiveGrant, hasStoreSubscription, isAdminGrant } from "@/lib/grants";
import { DeleteUserDialog, EditPlanDialog, GrantPremiumDialog, RevokePremiumDialog } from "./UserDialogs";

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: user, isPending, isError, error, refetch } = useUser(id);
  const { data: me } = useProfile();
  const [dialog, setDialog] = useState<"plan" | "grant" | "revoke" | "delete" | null>(null);
  const [now] = useState(() => new Date());

  const crumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "User Management", href: "/users" },
    { label: user ? displayName(user) : "User" },
  ];
  const back = (
    <ButtonLink href="/users" variant="secondary" icon={<ArrowLeft className="size-5" />}>
      Back
    </ButtonLink>
  );

  if (isError && !user) {
    const notFound = getErrorStatus(error) === 404 || getErrorStatus(error) === 400;
    return (
      <>
        <PageHeader title="User Details" crumbs={crumbs} actions={back} />
        <Card>
          {notFound ? (
            <ErrorState title="This user doesn't exist" error={new Error("They may have been deleted.")} />
          ) : (
            <ErrorState title="Couldn't load this user" error={error} onRetry={() => refetch()} />
          )}
        </Card>
      </>
    );
  }

  if (isPending || !user) {
    return (
      <>
        <PageHeader title="User Details" crumbs={crumbs} actions={back} />
        <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
          <Card className="flex flex-col items-center gap-4">
            <Skeleton className="size-16" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-52" />
          </Card>
          <Card className="space-y-5">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </Card>
        </div>
      </>
    );
  }

  const name = displayName(user);
  const isSelf = me?._id === user._id;
  const location = [user.country, user.city].filter(Boolean).join(", ");
  const storeSub = hasStoreSubscription(user);
  const liveGrant = hasLiveGrant(user, now);

  return (
    <>
      <PageHeader
        title="User Details"
        crumbs={crumbs}
        actions={
          <>
            {back}
            <Button
              variant="danger"
              icon={<Trash2 className="size-5" />}
              onClick={() => setDialog("delete")}
              disabled={isSelf}
              title={isSelf ? "You can't delete your own account here" : undefined}
            >
              Delete User
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <Card className="h-fit">
          <div className="flex flex-col items-center text-center">
            <Avatar name={name} src={user.avatar?.url} size={64} />
            <h2 className="mt-4 text-xl font-medium break-words">{name}</h2>
            <p className="mt-2 text-base break-all text-fg-2">{user.email}</p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <PlanBadge plan={user.plan} />
              <StatusBadge status={user.subscriptionStatus} />
            </div>
          </div>
          <hr className="my-6 border-line" />
          <ul className="space-y-5">
            <IconDetail icon={<Calendar />} label="Joined" value={formatDate(user.createdAt)} />
            <IconDetail icon={<CircleUser />} label="Country / City" value={location || "—"} />
            <IconDetail icon={<Phone />} label="Phone" value={user.phone || "—"} />
            <IconDetail icon={<Mail />} label="Email" value={user.email} />
            <IconDetail icon={<Smartphone />} label="Devices" value={describeDevices(user)} />
          </ul>
        </Card>

        <div className="flex min-w-0 flex-col gap-6">
          <Card>
            <CardTitle
              action={
                <div className="flex flex-wrap justify-end gap-2">
                  {liveGrant && (
                    <Button variant="ghost" size="sm" onClick={() => setDialog("revoke")}>
                      Revoke
                    </Button>
                  )}
                  <Button
                    size="sm"
                    icon={<Crown className="size-4" />}
                    onClick={() => setDialog("grant")}
                    disabled={storeSub}
                    title={storeSub ? "This user pays through the store. A grant would be overwritten at the next renewal." : undefined}
                  >
                    {liveGrant ? "Extend Premium" : "Grant Premium"}
                  </Button>
                  <Button variant="secondary" size="sm" icon={<SquarePen className="size-4" />} onClick={() => setDialog("plan")}>
                    Edit Plan
                  </Button>
                </div>
              }
            >
              Subscription
            </CardTitle>
            <dl className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2 xl:grid-cols-3">
              <Detail label="Plan">{PLAN_LABEL[user.plan] ?? user.plan}</Detail>
              <Detail label="Status">{STATUS_LABEL[user.subscriptionStatus] ?? user.subscriptionStatus}</Detail>
              <Detail label="Platform">
                {isAdminGrant(user) ? "Admin grant" : (PLATFORM_LABEL[user.subscriptionPlatform] ?? user.subscriptionPlatform)}
              </Detail>
              <Detail label="Product ID">
                <span className="break-all">{user.subscriptionProductId || "—"}</span>
              </Detail>
              <Detail label="Started">{formatDate(user.subscriptionStartDate)}</Detail>
              <Detail label="Expires">
                {liveGrant && !user.subscriptionExpiresAt ? "No end date" : formatDate(user.subscriptionExpiresAt)}
                {user.subscriptionExpiresAt && <span className="text-muted"> ({relativeDays(user.subscriptionExpiresAt)})</span>}
              </Detail>
            </dl>
          </Card>

          <Card>
            <CardTitle>Account</CardTitle>
            <dl className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2 xl:grid-cols-3">
              <Detail label="Role">{user.role === "admin" ? "Admin" : "User"}</Detail>
              <Detail label="User ID">
                <span className="font-mono text-sm break-all">{user._id}</span>
              </Detail>
              <Detail label="Last updated">{formatDate(user.updatedAt)}</Detail>
            </dl>
          </Card>

          <Card>
            <CardTitle className="mb-3">Activity</CardTitle>
            <p className="flex items-center gap-3 text-base text-fg-2">
              <Inbox className="size-5 shrink-0" aria-hidden />
              Watch history and subscription history aren&apos;t available from the API yet.
            </p>
          </Card>
        </div>
      </div>

      {user.role === "admin" && !isSelf && (
        <p className="mt-6 flex items-center gap-2 text-sm text-muted">
          <TriangleAlert className="size-4 text-warning" aria-hidden />
          This account is an admin.
        </p>
      )}

      <EditPlanDialog user={user} open={dialog === "plan"} onClose={() => setDialog(null)} />
      <GrantPremiumDialog user={user} open={dialog === "grant"} onClose={() => setDialog(null)} />
      <RevokePremiumDialog user={user} open={dialog === "revoke"} onClose={() => setDialog(null)} />
      <DeleteUserDialog
        user={user}
        open={dialog === "delete"}
        onClose={() => setDialog(null)}
        onDeleted={() => {
          setDialog(null);
          router.replace("/users");
        }}
      />
    </>
  );
}

function IconDetail({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <li className="flex items-start gap-4">
      <span className="mt-1 text-muted [&_svg]:size-5" aria-hidden>
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs text-subtle">{label}</p>
        <p className="mt-1 text-base break-words">{value}</p>
      </div>
    </li>
  );
}
