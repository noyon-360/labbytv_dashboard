"use client";

import { useState } from "react";
import { Crown, Save, Trash2, TriangleAlert } from "lucide-react";
import { getErrorMessage } from "@/api/client";
import { useDeleteUser, useUpdateUser } from "@/api/users";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";
import { DangerIcon, Modal } from "@/components/ui/Modal";
import { Alert } from "@/components/ui/States";
import { useToast } from "@/components/ui/Toast";
import { displayName, formatDate, formatDateTime, PLAN_LABEL, STATUS_LABEL } from "@/lib/format";
import {
  GRANT_OPTIONS,
  grantEnd,
  grantUpdate,
  hasLiveGrant,
  isMonthBased,
  revokeUpdate,
  toDateInput,
  type GrantDuration,
} from "@/lib/grants";
import type { Plan, SubscriptionStatus, User } from "@/types/api";

const PLAN_OPTIONS = (Object.keys(PLAN_LABEL) as Plan[]).map((value) => ({ value, label: PLAN_LABEL[value] }));
const STATUS_OPTIONS = (["active", "trialing", "past_due", "canceled", "none"] as SubscriptionStatus[]).map((value) => ({
  value,
  label: STATUS_LABEL[value],
}));

export function EditPlanDialog({ user, open, onClose }: { user: User; open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Edit subscription">
      {/* Remount the form on each open so it starts from the saved values. */}
      {open && <EditPlanForm user={user} onClose={onClose} />}
    </Modal>
  );
}

function EditPlanForm({ user, onClose }: { user: User; onClose: () => void }) {
  const toast = useToast();
  const update = useUpdateUser(user._id);
  const [plan, setPlan] = useState<Plan>(user.plan);
  const [status, setStatus] = useState<SubscriptionStatus>(user.subscriptionStatus);
  const unchanged = plan === user.plan && status === user.subscriptionStatus;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await update.mutateAsync({ plan, subscriptionStatus: status });
      toast.success("User updated");
      onClose();
    } catch {
      // shown inline below
    }
  };

  return (
    <form onSubmit={save} className="flex flex-col gap-5">
      <Select label="Plan" value={plan} onChange={(e) => setPlan(e.target.value as Plan)} options={PLAN_OPTIONS} data-autofocus />
      <Select
        label="Status"
        value={status}
        onChange={(e) => setStatus(e.target.value as SubscriptionStatus)}
        options={STATUS_OPTIONS}
      />
      <Alert tone="info">
        This changes what the user can access in the app right away. It doesn&apos;t change their App Store or Google Play billing,
        and the next store renewal or webhook can overwrite it.
      </Alert>
      {update.isError && <Alert tone="danger">{getErrorMessage(update.error)}</Alert>}
      <div className="mt-2 flex justify-end gap-3">
        <Button variant="secondary" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" size="sm" loading={update.isPending} disabled={unchanged} icon={<Save className="size-4" />}>
          Save Changes
        </Button>
      </div>
    </form>
  );
}

export function DeleteUserDialog({ user, open, onClose, onDeleted }: {
  user: User;
  open: boolean;
  onClose: () => void;
  onDeleted: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Delete this user?"
      hideClose
      icon={
        <DangerIcon>
          <TriangleAlert className="size-6" />
        </DangerIcon>
      }
    >
      {open && <DeleteUserForm user={user} onClose={onClose} onDeleted={onDeleted} />}
    </Modal>
  );
}

function DeleteUserForm({ user, onClose, onDeleted }: { user: User; onClose: () => void; onDeleted: () => void }) {
  const toast = useToast();
  const remove = useDeleteUser();
  const [typed, setTyped] = useState("");
  const confirmed = typed.trim() === "DELETE";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmed) return;
    try {
      await remove.mutateAsync(user._id);
      toast.success(`${displayName(user)} was deleted`);
      onDeleted();
    } catch {
      // shown inline below
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <p className="text-base leading-relaxed text-fg-2">
        <span className="font-medium text-fg">{displayName(user)}</span> ({user.email}) will be deleted permanently. This
        can&apos;t be undone. Their playlists and watch history are not removed.
      </p>
      <Input
        label="Type DELETE to confirm"
        value={typed}
        onChange={(e) => setTyped(e.target.value)}
        autoComplete="off"
        spellCheck={false}
        data-autofocus
      />
      {remove.isError && <Alert tone="danger">{getErrorMessage(remove.error, "Couldn't delete the user. Try again.")}</Alert>}
      <div className="mt-2 flex justify-end gap-3">
        <Button variant="secondary" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" variant="danger" size="sm" disabled={!confirmed} loading={remove.isPending} icon={<Trash2 className="size-4" />}>
          Delete User
        </Button>
      </div>
    </form>
  );
}

export function GrantPremiumDialog({ user, open, onClose }: { user: User; open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Grant premium">
      {open && <GrantPremiumForm user={user} onClose={onClose} />}
    </Modal>
  );
}

function GrantPremiumForm({ user, onClose }: { user: User; onClose: () => void }) {
  const toast = useToast();
  const update = useUpdateUser(user._id);
  // Fixed while the dialog is open so the preview doesn't move; save uses a fresh time.
  const [openedAt] = useState(() => new Date());
  const [duration, setDuration] = useState<GrantDuration>("1y");
  const [customDate, setCustomDate] = useState("");
  const currentEnd = hasLiveGrant(user, openedAt) && user.subscriptionExpiresAt ? new Date(user.subscriptionExpiresAt) : null;
  const [extend, setExtend] = useState(true);
  const extending = Boolean(currentEnd) && extend && isMonthBased(duration);

  const endFrom = (now: Date) => grantEnd(duration, extending && currentEnd ? currentEnd : now, now, customDate);
  const end = endFrom(openedAt);
  const customError =
    duration !== "custom"
      ? undefined
      : !customDate
        ? "Choose a date"
        : end && end <= openedAt
          ? "Choose a date in the future"
          : undefined;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (customError) return;
    const now = new Date();
    const finalEnd = endFrom(now);
    // Keep the original start date when extending a grant.
    const start = extending && user.subscriptionStartDate ? new Date(user.subscriptionStartDate) : now;
    try {
      await update.mutateAsync(grantUpdate(start, finalEnd));
      toast.success(finalEnd ? `Premium until ${formatDate(finalEnd)}` : "Premium with no end date");
      onClose();
    } catch {
      // shown inline below
    }
  };

  return (
    <form onSubmit={save} className="flex flex-col gap-5">
      <p className="text-base leading-relaxed text-fg-2">
        Give <span className="font-medium text-fg">{displayName(user)}</span> premium access without a store purchase.
      </p>
      <Select
        label="Duration"
        value={duration}
        onChange={(e) => setDuration(e.target.value as GrantDuration)}
        options={GRANT_OPTIONS}
        data-autofocus
      />
      {duration === "custom" && (
        <Input
          label="Premium until (end of this day)"
          type="date"
          min={toDateInput(openedAt)}
          value={customDate}
          onChange={(e) => setCustomDate(e.target.value)}
          error={customDate ? customError : undefined}
        />
      )}
      {currentEnd && isMonthBased(duration) && (
        <label className="flex cursor-pointer items-start gap-3 text-base text-fg-2">
          <input
            type="checkbox"
            checked={extend}
            onChange={(e) => setExtend(e.target.checked)}
            className="mt-0.5 size-4 accent-brand"
          />
          <span>Add to their current grant, which ends {formatDate(currentEnd)}</span>
        </label>
      )}
      <div className="rounded-lg bg-field px-4 py-3">
        <p className="text-xs text-subtle">Premium until</p>
        <p className="mt-1 text-lg font-medium">
          {duration === "forever" ? "No end date" : end && !customError ? formatDateTime(end) : "—"}
        </p>
      </div>
      <Alert tone="info">
        {duration === "forever"
          ? "Access lasts until an admin revokes it."
          : "Access ends at this time and the user goes back to Free. The app sends its usual reminder 3 days before."}
      </Alert>
      {update.isError && <Alert tone="danger">{getErrorMessage(update.error)}</Alert>}
      <div className="mt-2 flex justify-end gap-3">
        <Button variant="secondary" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          size="sm"
          loading={update.isPending}
          disabled={Boolean(customError)}
          icon={<Crown className="size-4" />}
        >
          Grant Premium
        </Button>
      </div>
    </form>
  );
}

export function RevokePremiumDialog({ user, open, onClose }: { user: User; open: boolean; onClose: () => void }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Revoke premium?"
      hideClose
      icon={
        <DangerIcon>
          <TriangleAlert className="size-6" />
        </DangerIcon>
      }
    >
      {open && <RevokePremiumForm user={user} onClose={onClose} />}
    </Modal>
  );
}

function RevokePremiumForm({ user, onClose }: { user: User; onClose: () => void }) {
  const toast = useToast();
  const update = useUpdateUser(user._id);

  const revoke = async () => {
    try {
      await update.mutateAsync(revokeUpdate(new Date()));
      toast.success("Premium revoked");
      onClose();
    } catch {
      // shown inline below
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <p className="text-base leading-relaxed text-fg-2">
        <span className="font-medium text-fg">{displayName(user)}</span> goes back to the Free plan right away
        {user.subscriptionExpiresAt ? `, instead of on ${formatDate(user.subscriptionExpiresAt)}` : ""}.
      </p>
      {update.isError && <Alert tone="danger">{getErrorMessage(update.error)}</Alert>}
      <div className="mt-2 flex justify-end gap-3">
        <Button variant="secondary" size="sm" onClick={onClose} data-autofocus>
          Cancel
        </Button>
        <Button variant="danger" size="sm" loading={update.isPending} onClick={revoke}>
          Revoke Premium
        </Button>
      </div>
    </div>
  );
}
