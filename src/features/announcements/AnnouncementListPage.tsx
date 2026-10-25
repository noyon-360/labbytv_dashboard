"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { Plus, Search, SquarePen, Trash2, TriangleAlert } from "lucide-react";
import Link from "next/link";
import {
  announcementState,
  useAnnouncements,
  useDeleteAnnouncement,
  useSaveAnnouncement,
  type AnnouncementState,
} from "@/api/announcements";
import { getErrorMessage } from "@/api/client";
import { AnnouncementStateBadge, ANNOUNCEMENT_TYPE, Badge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FilterTabs } from "@/components/ui/FilterTabs";
import { Input } from "@/components/ui/Field";
import { DangerIcon, Modal } from "@/components/ui/Modal";
import { Alert, EmptyState, ErrorState, NoResults, TableSkeleton } from "@/components/ui/States";
import { Switch } from "@/components/ui/Switch";
import { Table, Td, Th, Tr } from "@/components/ui/Table";
import { useToast } from "@/components/ui/Toast";
import { PageHeader } from "@/layout/PageHeader";
import { formatDate } from "@/lib/format";
import type { Announcement } from "@/types/api";

type Filter = "all" | AnnouncementState;

function visibleWindow(a: Announcement) {
  if (!a.startsAt && !a.endsAt) return "Always";
  return `${a.startsAt ? formatDate(a.startsAt) : "Now"} – ${a.endsAt ? formatDate(a.endsAt) : "No end"}`;
}

export function AnnouncementListPage() {
  const { data, isPending, isError, error, refetch } = useAnnouncements();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [toDelete, setToDelete] = useState<Announcement | null>(null);
  const q = useDeferredValue(query.trim().toLowerCase());

  const withState = useMemo(() => {
    const now = new Date();
    // Same order the app uses: highest priority first, newest first among equals.
    return (data ?? [])
      .map((a) => ({ a, state: announcementState(a, now) }))
      .sort((x, y) => y.a.priority - x.a.priority || +new Date(y.a.createdAt) - +new Date(x.a.createdAt));
  }, [data]);

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: 0, active: 0, scheduled: 0, expired: 0, inactive: 0 };
    withState.forEach(({ state }) => {
      c.all++;
      c[state]++;
    });
    return c;
  }, [withState]);

  const rows = withState.filter(
    ({ a, state }) =>
      (filter === "all" || state === filter) &&
      (!q || a.title.toLowerCase().includes(q) || a.message.toLowerCase().includes(q)),
  );

  return (
    <>
      <PageHeader
        title="Announcements"
        crumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Announcements" }]}
        actions={
          <ButtonLink href="/announcements/new" icon={<Plus className="size-5" />}>
            Create Announcement
          </ButtonLink>
        }
      />

      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <Input
          label="Search"
          type="search"
          placeholder="Search by title or message"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          trailing={<Search className="size-5" aria-hidden />}
          containerClassName="w-full lg:max-w-[380px]"
        />
        <FilterTabs
          label="Filter by status"
          value={filter}
          onChange={setFilter}
          tabs={[
            { value: "all", label: "All", count: counts.all },
            { value: "active", label: "Active", count: counts.active },
            { value: "scheduled", label: "Scheduled", count: counts.scheduled },
            { value: "expired", label: "Expired", count: counts.expired },
            { value: "inactive", label: "Inactive", count: counts.inactive },
          ]}
        />
      </div>

      {isError ? (
        <Card>
          <ErrorState title="Couldn't load announcements" error={error} onRetry={() => refetch()} />
        </Card>
      ) : isPending ? (
        <div className="rounded-xl bg-surface">
          <TableSkeleton rows={4} cols={5} />
        </div>
      ) : withState.length === 0 ? (
        <Card>
          <EmptyState title="No announcements yet" body="Create one to show a message on the app's Home screen." />
        </Card>
      ) : rows.length === 0 ? (
        <Card>
          <NoResults
            query={query.trim()}
            hint="Try a different word or another status."
            onClear={() => {
              setQuery("");
              setFilter("all");
            }}
          />
        </Card>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Announcement</Th>
              <Th>Type</Th>
              <Th>Priority</Th>
              <Th>Visible</Th>
              <Th>Status</Th>
              <Th className="text-right">Action</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ a, state }) => (
              <AnnouncementRow key={a._id} announcement={a} state={state} onDelete={() => setToDelete(a)} />
            ))}
          </tbody>
        </Table>
      )}

      {!isPending && !isError && withState.length > 0 && (
        <p className="mt-6 text-sm text-subtle">
          Showing {rows.length} of {withState.length} · The app shows up to 5 active announcements, highest priority first.
        </p>
      )}

      <DeleteAnnouncementDialog announcement={toDelete} onClose={() => setToDelete(null)} />
    </>
  );
}

function AnnouncementRow({ announcement: a, state, onDelete }: { announcement: Announcement; state: AnnouncementState; onDelete: () => void }) {
  const toast = useToast();
  const save = useSaveAnnouncement(a._id);
  const type = ANNOUNCEMENT_TYPE[a.type] ?? ANNOUNCEMENT_TYPE.info;
  const iconBtn = "rounded-lg p-2 transition-colors hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-brand";

  return (
    <Tr>
      <Td className="max-w-[340px]">
        <p className="truncate text-base">{a.title}</p>
        <p className="mt-1 line-clamp-2 text-sm text-fg-2">{a.message}</p>
      </Td>
      <Td>
        <Badge tone={type.tone}>{type.label}</Badge>
      </Td>
      <Td className="tabular-nums">{a.priority}</Td>
      <Td className="text-sm whitespace-nowrap text-fg-2">{visibleWindow(a)}</Td>
      <Td>
        <div className="flex items-center gap-3">
          <Switch
            checked={a.isActive}
            disabled={save.isPending}
            label={`${a.isActive ? "Deactivate" : "Activate"} “${a.title}”`}
            onChange={async (isActive) => {
              try {
                await save.mutateAsync({ isActive });
                toast.success(isActive ? "Announcement activated" : "Announcement deactivated");
              } catch (err) {
                toast.error(getErrorMessage(err));
              }
            }}
          />
          <AnnouncementStateBadge state={state} />
        </div>
      </Td>
      <Td className="text-right whitespace-nowrap">
        <Link href={`/announcements/${a._id}/edit`} className={`${iconBtn} inline-flex text-fg`} aria-label={`Edit “${a.title}”`}>
          <SquarePen className="size-5" />
        </Link>
        <button type="button" onClick={onDelete} className={`${iconBtn} ml-1 text-danger`} aria-label={`Delete “${a.title}”`}>
          <Trash2 className="size-5" />
        </button>
      </Td>
    </Tr>
  );
}

function DeleteAnnouncementDialog({ announcement, onClose }: { announcement: Announcement | null; onClose: () => void }) {
  const toast = useToast();
  const remove = useDeleteAnnouncement();
  const close = () => {
    remove.reset();
    onClose();
  };
  return (
    <Modal
      open={Boolean(announcement)}
      onClose={close}
      title="Delete this announcement?"
      hideClose
      icon={
        <DangerIcon>
          <TriangleAlert className="size-6" />
        </DangerIcon>
      }
    >
      <p className="text-base leading-relaxed text-fg-2">
        <span className="font-medium text-fg">“{announcement?.title}”</span> will be removed from the app right away. This
        can&apos;t be undone. To hide it for now, turn it off instead.
      </p>
      {remove.isError && <Alert tone="danger" className="mt-5">{getErrorMessage(remove.error)}</Alert>}
      <div className="mt-8 flex justify-end gap-3">
        <Button variant="secondary" size="sm" onClick={close} data-autofocus>
          Cancel
        </Button>
        <Button
          variant="danger"
          size="sm"
          loading={remove.isPending}
          icon={<Trash2 className="size-4" />}
          onClick={async () => {
            if (!announcement) return;
            try {
              await remove.mutateAsync(announcement._id);
              toast.success("Announcement deleted");
              close();
            } catch {
              // shown inline
            }
          }}
        >
          Delete
        </Button>
      </div>
    </Modal>
  );
}
