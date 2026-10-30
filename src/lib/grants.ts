import type { User, UserUpdate } from "@/types/api";
import { hasLiveSubscription } from "./stats";

// Premium given from the dashboard instead of a store purchase. The app treats
// plan "premium" + a future subscriptionExpiresAt as premium, and the backend's
// daily expiry job sets the user back to free once that date passes.
export const ADMIN_GRANT_PRODUCT = "admin_grant";

export type GrantDuration = "1m" | "3m" | "6m" | "1y" | "2y" | "year-end" | "custom" | "forever";

export const GRANT_OPTIONS: { value: GrantDuration; label: string }[] = [
  { value: "1m", label: "1 month" },
  { value: "3m", label: "3 months" },
  { value: "6m", label: "6 months" },
  { value: "1y", label: "1 year" },
  { value: "2y", label: "2 years" },
  { value: "year-end", label: "Until the end of this year" },
  { value: "custom", label: "Until a date I choose" },
  { value: "forever", label: "No end date" },
];

const MONTHS: Partial<Record<GrantDuration, number>> = { "1m": 1, "3m": 3, "6m": 6, "1y": 12, "2y": 24 };

/** Durations that count from a start point (so they can extend a current grant). */
export function isMonthBased(duration: GrantDuration) {
  return duration in MONTHS;
}

export function isAdminGrant(u: User) {
  return u.subscriptionProductId === ADMIN_GRANT_PRODUCT;
}

/** A paid App Store / Google Play subscription that a grant would overwrite. */
export function hasStoreSubscription(u: User) {
  return hasLiveSubscription(u) && (u.subscriptionPlatform === "apple" || u.subscriptionPlatform === "google");
}

/** A grant that still gives access (no end date, or an end date in the future). */
export function hasLiveGrant(u: User, now: Date) {
  if (!isAdminGrant(u) || !hasLiveSubscription(u) || u.plan !== "premium") return false;
  return !u.subscriptionExpiresAt || new Date(u.subscriptionExpiresAt) > now;
}

/** Adds months, clamping to the last day (31 Jan + 1 month = 28/29 Feb). */
function addMonths(from: Date, months: number) {
  const d = new Date(from);
  const day = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + months);
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, lastDay));
  return d;
}

/** "2026-10-26" (from <input type="date">) -> the end of that day in the admin's time zone. */
export function endOfLocalDay(value: string) {
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d, 23, 59, 59, 999);
}

/**
 * When the grant ends, or null for no end date. `base` is where month-based
 * durations count from: now, or the current grant's end date when extending.
 */
export function grantEnd(duration: GrantDuration, base: Date, now: Date, customDate: string): Date | null {
  const months = MONTHS[duration];
  if (months) return addMonths(base, months);
  if (duration === "year-end") return new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
  if (duration === "custom") return endOfLocalDay(customDate);
  return null;
}

export function grantUpdate(start: Date, end: Date | null): UserUpdate {
  return {
    plan: "premium",
    subscriptionStatus: "active",
    subscriptionPlatform: "none",
    subscriptionProductId: ADMIN_GRANT_PRODUCT,
    subscriptionStartDate: start.toISOString(),
    subscriptionExpiresAt: end ? end.toISOString() : null,
  };
}

/** Ends access now. Status "canceled" keeps the expiry job from sending an "expired" push later. */
export function revokeUpdate(now: Date): UserUpdate {
  return {
    plan: "free",
    subscriptionStatus: "canceled",
    subscriptionPlatform: "none",
    subscriptionProductId: "",
    subscriptionExpiresAt: now.toISOString(),
  };
}

/** "2026-10-26" for <input type="date" min>. */
export function toDateInput(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
