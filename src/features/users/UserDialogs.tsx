"use client";

import { useState } from "react";
import { Save, Trash2, TriangleAlert } from "lucide-react";
import { getErrorMessage } from "@/api/client";
import { useDeleteUser, useUpdateUser } from "@/api/users";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";
import { DangerIcon, Modal } from "@/components/ui/Modal";
import { Alert } from "@/components/ui/States";
import { useToast } from "@/components/ui/Toast";
import { displayName, PLAN_LABEL, STATUS_LABEL } from "@/lib/format";
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
