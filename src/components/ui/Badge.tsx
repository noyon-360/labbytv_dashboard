import { cn } from "@/lib/cn";
import { PLAN_LABEL, STATUS_LABEL } from "@/lib/format";
import type { AnnouncementType, Plan, SubscriptionStatus } from "@/types/api";
import type { AnnouncementState } from "@/api/announcements";

export type Tone = "neutral" | "info" | "success" | "warning" | "premium" | "danger";

const TONES: Record<Tone, string> = {
  neutral: "bg-white/10 text-muted",
  info: "bg-info/15 text-info",
  success: "bg-success/15 text-success-fg",
  warning: "bg-warning/15 text-warning",
  premium: "bg-premium/15 text-premium",
  danger: "bg-danger/20 text-danger-fg",
};

/** Pill with a dot and a label. The label carries the meaning, so color is never the only cue. */
export function Badge({ tone = "neutral", children, className }: { tone?: Tone; children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs leading-none font-medium whitespace-nowrap",
        TONES[tone],
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {children}
    </span>
  );
}

const PLAN_TONE: Record<Plan, Tone> = { free: "neutral", basic: "info", premium: "premium" };

export function PlanBadge({ plan }: { plan: Plan }) {
  return <Badge tone={PLAN_TONE[plan] ?? "neutral"}>{PLAN_LABEL[plan] ?? plan}</Badge>;
}

const STATUS_TONE: Record<SubscriptionStatus, Tone> = {
  none: "neutral",
  active: "success",
  trialing: "info",
  past_due: "warning",
  canceled: "danger",
};

export function StatusBadge({ status }: { status: SubscriptionStatus }) {
  return <Badge tone={STATUS_TONE[status] ?? "neutral"}>{STATUS_LABEL[status] ?? status}</Badge>;
}

export const ANNOUNCEMENT_TYPE: Record<AnnouncementType, { label: string; tone: Tone }> = {
  update: { label: "Update", tone: "info" },
  feature: { label: "Feature", tone: "premium" },
  maintenance: { label: "Maintenance", tone: "warning" },
  important: { label: "Important", tone: "danger" },
  info: { label: "Info", tone: "neutral" },
};

const STATE: Record<AnnouncementState, { label: string; tone: Tone }> = {
  active: { label: "Active", tone: "success" },
  scheduled: { label: "Scheduled", tone: "info" },
  expired: { label: "Expired", tone: "neutral" },
  inactive: { label: "Inactive", tone: "neutral" },
};

export function AnnouncementStateBadge({ state }: { state: AnnouncementState }) {
  return <Badge tone={STATE[state].tone}>{STATE[state].label}</Badge>;
}
