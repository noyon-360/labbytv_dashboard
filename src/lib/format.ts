import type { Plan, SubscriptionPlatform, SubscriptionStatus, User } from "@/types/api";

const dateFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const dateTimeFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const numberFmt = new Intl.NumberFormat("en-US");

// en-GB writes September as "Sept"; the designs use three-letter months.
const tidy = (s: string) => s.replace("Sept", "Sep");

export function formatDate(value?: string | Date | null): string {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : tidy(dateFmt.format(d));
}

export function formatDateTime(value?: string | Date | null): string {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : tidy(dateTimeFmt.format(d));
}

export function formatNumber(n: number): string {
  return numberFmt.format(n);
}

export function formatPercent(n: number, digits = 1): string {
  return `${n.toFixed(digits).replace(/\.0$/, "")}%`;
}

/** "in 12 days", "today", "3 days ago". */
export function relativeDays(value?: string | null, now = new Date()): string {
  if (!value) return "";
  const days = Math.round((new Date(value).getTime() - now.getTime()) / 86_400_000);
  if (days === 0) return "today";
  if (days > 0) return `in ${days} day${days === 1 ? "" : "s"}`;
  return `${-days} day${days === -1 ? "" : "s"} ago`;
}

export function displayName(user: Pick<User, "name" | "email">): string {
  return user.name?.trim() || user.email.split("@")[0];
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

/** "jo***@gmail.com" */
export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}${"*".repeat(Math.max(3, local.length - visible.length))}@${domain}`;
}

export const PLAN_LABEL: Record<Plan, string> = {
  free: "Free",
  basic: "Basic",
  premium: "Premium",
};

export const STATUS_LABEL: Record<SubscriptionStatus, string> = {
  none: "None",
  active: "Active",
  trialing: "Trialing",
  past_due: "Past due",
  canceled: "Canceled",
};

export const PLATFORM_LABEL: Record<SubscriptionPlatform, string> = {
  none: "—",
  apple: "Apple App Store",
  google: "Google Play",
};

const DEVICE_LABEL: Record<string, string> = {
  ios: "iOS",
  android: "Android",
  macos: "macOS",
  web: "Web",
};

export function describeDevices(user: Pick<User, "fcmTokens">): string {
  const tokens = user.fcmTokens ?? [];
  if (tokens.length === 0) return "None registered";
  const platforms = [...new Set(tokens.map((t) => DEVICE_LABEL[t.platform] ?? t.platform))];
  return `${tokens.length} (${platforms.join(", ")})`;
}
