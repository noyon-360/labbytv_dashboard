"use client";

import { useParams, useRouter } from "next/navigation";
import { useForm, useWatch, type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Info, Megaphone, RefreshCw, Sparkles, TriangleAlert, Wrench, X } from "lucide-react";
import { useAnnouncements, useSaveAnnouncement } from "@/api/announcements";
import { getErrorMessage } from "@/api/client";
import { ANNOUNCEMENT_TYPE } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CharCount, Input, Select, Textarea } from "@/components/ui/Field";
import { Alert, ErrorState, Skeleton } from "@/components/ui/States";
import { Switch } from "@/components/ui/Switch";
import { useToast } from "@/components/ui/Toast";
import { PageHeader } from "@/layout/PageHeader";
import { cn } from "@/lib/cn";
import type { Announcement, AnnouncementInput, AnnouncementType } from "@/types/api";

const TYPES = Object.keys(ANNOUNCEMENT_TYPE) as AnnouncementType[];

// Limits match the backend model (model/announcement.model.js).
const schema = z
  .object({
    title: z.string().trim().min(1, "Add a title").max(120, "Keep the title under 120 characters"),
    message: z.string().trim().min(1, "Add a message").max(1000, "Keep the message under 1000 characters"),
    type: z.enum(TYPES as [AnnouncementType, ...AnnouncementType[]]),
    actionLabel: z.string().trim().max(40, "Keep the label under 40 characters"),
    actionUrl: z
      .string()
      .trim()
      .refine((v) => !v || /^https?:\/\/\S+$/i.test(v), "Must start with http:// or https://"),
    priority: z.number({ error: "Enter a number" }).int("Use a whole number").min(-1000).max(1000),
    isActive: z.boolean(),
    startsAt: z.string(),
    endsAt: z.string(),
  })
  .refine((v) => Boolean(v.actionLabel) === Boolean(v.actionUrl), {
    path: ["actionUrl"],
    message: "Add both a button label and a link, or leave both empty",
  })
  .refine((v) => !v.startsAt || !v.endsAt || new Date(v.endsAt) > new Date(v.startsAt), {
    path: ["endsAt"],
    message: "End must be after the start",
  });

type Values = z.infer<typeof schema>;

/** ISO date -> value for <input type="datetime-local"> in the admin's time zone. */
function toLocalInput(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

function toValues(a?: Announcement): Values {
  return {
    title: a?.title ?? "",
    message: a?.message ?? "",
    type: a?.type ?? "info",
    actionLabel: a?.actionLabel ?? "",
    actionUrl: a?.actionUrl ?? "",
    priority: a?.priority ?? 0,
    isActive: a?.isActive ?? true,
    startsAt: toLocalInput(a?.startsAt),
    endsAt: toLocalInput(a?.endsAt),
  };
}

function toInput(v: Values): AnnouncementInput {
  return {
    ...v,
    // Empty dates are sent as null so an edit can clear them (open-ended window).
    startsAt: v.startsAt ? new Date(v.startsAt).toISOString() : null,
    endsAt: v.endsAt ? new Date(v.endsAt).toISOString() : null,
  };
}

/** /announcements/new and /announcements/[id]/edit. */
export function AnnouncementFormPage() {
  const params = useParams<{ id?: string }>();
  const id = params.id;
  const { data, isPending, isError, error, refetch } = useAnnouncements();
  const title = id ? "Edit Announcement" : "Create Announcement";
  const crumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Announcements", href: "/announcements" },
    { label: id ? "Edit" : "Create" },
  ];

  if (!id) return <AnnouncementForm key="new" title={title} crumbs={crumbs} />;

  if (isError) {
    return (
      <>
        <PageHeader title={title} crumbs={crumbs} />
        <Card>
          <ErrorState title="Couldn't load this announcement" error={error} onRetry={() => refetch()} />
        </Card>
      </>
    );
  }
  if (isPending) {
    return (
      <>
        <PageHeader title={title} crumbs={crumbs} />
        <Card className="space-y-6">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-32 w-full" />
        </Card>
      </>
    );
  }
  const existing = data.find((a) => a._id === id);
  if (!existing) {
    return (
      <>
        <PageHeader title={title} crumbs={crumbs} />
        <Card>
          <ErrorState title="This announcement doesn't exist" error={new Error("It may have been deleted.")} />
        </Card>
      </>
    );
  }
  return <AnnouncementForm key={existing._id} title={title} crumbs={crumbs} existing={existing} />;
}

function AnnouncementForm({ title, crumbs, existing }: {
  title: string;
  crumbs: { label: string; href?: string }[];
  existing?: Announcement;
}) {
  const router = useRouter();
  const toast = useToast();
  const save = useSaveAnnouncement(existing?._id);
  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: toValues(existing) });
  const [titleValue, messageValue, isActive] = useWatch({ control, name: ["title", "message", "isActive"] });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await save.mutateAsync(toInput(values));
      toast.success(existing ? "Announcement updated" : "Announcement published");
      // Next keeps this page mounted after navigation, so reset it for the next visit:
      // empty for "create", the saved values for "edit".
      reset(existing ? values : toValues());
      router.push("/announcements");
    } catch {
      // shown inline
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate>
      <PageHeader
        title={title}
        crumbs={crumbs}
        actions={
          <>
            <ButtonLink href="/announcements" variant="secondary">
              Cancel
            </ButtonLink>
            <Button type="submit" loading={isSubmitting} disabled={Boolean(existing) && !isDirty}>
              {existing ? "Save Changes" : "Publish"}
            </Button>
          </>
        }
      />

      {save.isError && (
        <Alert tone="danger" className="mb-6">
          {getErrorMessage(save.error)}
        </Alert>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Card className="flex flex-col gap-6">
          <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_240px]">
            <Input label="Title" placeholder="Version 2.4 is out" error={errors.title?.message} hint={<CharCount value={titleValue} max={120} />} {...register("title")} />
            <Select label="Type" options={TYPES.map((t) => ({ value: t, label: ANNOUNCEMENT_TYPE[t].label }))} {...register("type")} />
          </div>
          <Textarea
            label="Message"
            placeholder="Update now for faster Live TV loading and the new TV guide."
            error={errors.message?.message}
            hint={<CharCount value={messageValue} max={1000} />}
            {...register("message")}
          />
          <div className="grid gap-5 md:grid-cols-2">
            <Input label="Button label (optional)" placeholder="Update now" error={errors.actionLabel?.message} hint="Up to 40 characters" {...register("actionLabel")} />
            <Input
              label="Button link (optional)"
              type="url"
              placeholder="https://apps.apple.com/app/labby-tv"
              error={errors.actionUrl?.message}
              hint="Must start with http:// or https://"
              {...register("actionUrl")}
            />
          </div>
          <div className="grid gap-5 md:grid-cols-[160px_minmax(0,1fr)_minmax(0,1fr)]">
            <Input
              label="Priority"
              type="number"
              step={1}
              error={errors.priority?.message}
              hint="Higher shows first"
              {...register("priority", { valueAsNumber: true })}
            />
            <Input label="Starts (optional)" type="datetime-local" hint="Empty means now" error={errors.startsAt?.message} {...register("startsAt")} />
            <Input label="Ends (optional)" type="datetime-local" hint="Empty means no end" error={errors.endsAt?.message} {...register("endsAt")} />
          </div>
          <div className="flex items-start gap-4">
            <Switch
              id="isActive"
              checked={isActive}
              label="Active"
              onChange={(v) => setValue("isActive", v, { shouldDirty: true })}
              className="mt-0.5"
            />
            <div>
              <label htmlFor="isActive" className="text-base font-medium">
                Active
              </label>
              <p className="mt-1 text-sm text-fg-2">Show it in the app as soon as the start time is reached.</p>
            </div>
          </div>
        </Card>

        <Card className="h-fit xl:sticky xl:top-28">
          <h2 className="text-xl font-semibold">Preview</h2>
          <p className="mt-2 text-sm text-fg-2">How it appears on the app&apos;s Home screen.</p>
          <Preview control={control} />
        </Card>
      </div>
    </form>
  );
}

const TYPE_ICON: Record<AnnouncementType, React.ComponentType<{ className?: string }>> = {
  update: RefreshCw,
  feature: Sparkles,
  maintenance: Wrench,
  important: TriangleAlert,
  info: Info,
};

const TYPE_STYLE: Record<AnnouncementType, string> = {
  update: "border-info/60 bg-info/10 text-info",
  feature: "border-premium/50 bg-premium/10 text-premium",
  maintenance: "border-warning/50 bg-warning/10 text-warning",
  important: "border-danger/60 bg-danger/10 text-danger-fg",
  info: "border-line bg-white/5 text-muted",
};

function Preview({ control }: { control: Control<Values> }) {
  const [title, message, type, actionLabel] = useWatch({ control, name: ["title", "message", "type", "actionLabel"] });
  const Icon = TYPE_ICON[type] ?? Megaphone;
  return (
    <div className="mt-6 rounded-2xl bg-black p-4" aria-hidden>
      <div className={cn("rounded-xl border p-4", TYPE_STYLE[type])}>
        <div className="flex items-start gap-3">
          <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-white/10">
            <Icon className="size-4" />
          </span>
          <p className="min-w-0 flex-1 pt-1 text-base font-medium break-words text-fg">{title || "Announcement title"}</p>
          <X className="mt-1 size-4 shrink-0 text-fg-2" />
        </div>
        <p className="mt-3 text-sm leading-relaxed break-words whitespace-pre-line text-fg-2">
          {message || "Your message shows here."}
        </p>
        {actionLabel && (
          <span className="mt-4 inline-flex rounded-full bg-info px-4 py-1.5 text-sm font-medium text-fg">{actionLabel}</span>
        )}
      </div>
      <div className="mt-4 space-y-2.5">
        <div className="h-2.5 w-2/3 rounded-full bg-white/10" />
        <div className="h-2.5 w-11/12 rounded-full bg-white/10" />
        <div className="h-2.5 w-4/5 rounded-full bg-white/10" />
      </div>
    </div>
  );
}
