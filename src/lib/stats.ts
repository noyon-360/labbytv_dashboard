import type { Plan, SubscriptionPlatform, User } from "@/types/api";

// There's no stats endpoint; everything here is computed from GET /admin/users.

const DAY = 86_400_000;

/** A subscription that currently grants access (RevenueCat "trialing" counts). */
export function hasLiveSubscription(u: User) {
  return u.subscriptionStatus === "active" || u.subscriptionStatus === "trialing";
}

export type Delta = { text: string; direction: "up" | "down" | "flat" };

/** Sign-ups in the last `days` days compared with the `days` before that. */
export function signupGrowth(users: User[], days = 30, now = Date.now()) {
  let current = 0;
  let previous = 0;
  for (const u of users) {
    const age = now - new Date(u.createdAt).getTime();
    if (age < days * DAY) current++;
    else if (age < 2 * days * DAY) previous++;
  }
  return { current, previous, delta: compare(current, previous) };
}

export function compare(current: number, previous: number): Delta {
  if (previous === 0) {
    return current === 0 ? { text: "No change", direction: "flat" } : { text: `+${current} new`, direction: "up" };
  }
  const pct = ((current - previous) / previous) * 100;
  if (Math.abs(pct) < 0.05) return { text: "0%", direction: "flat" };
  return { text: `${pct > 0 ? "+" : ""}${pct.toFixed(1).replace(/\.0$/, "")}%`, direction: pct > 0 ? "up" : "down" };
}

export function countBy<K extends string>(users: User[], key: (u: User) => K): Record<K, number> {
  const out = {} as Record<K, number>;
  for (const u of users) {
    const k = key(u);
    out[k] = (out[k] ?? 0) + 1;
  }
  return out;
}

export const PLANS: Plan[] = ["free", "basic", "premium"];

export function planBreakdown(users: User[]): { plan: Plan; count: number }[] {
  const counts = countBy(users, (u) => u.plan ?? "free");
  return PLANS.map((plan) => ({ plan, count: counts[plan] ?? 0 }));
}

export function platformSplit(users: User[]) {
  const live = users.filter(hasLiveSubscription);
  const counts = countBy(live, (u) => u.subscriptionPlatform ?? "none");
  return { apple: counts.apple ?? 0, google: counts.google ?? 0, total: live.length };
}

export type ProductRow = {
  productId: string;
  platform: SubscriptionPlatform;
  plan: Plan;
  activeUsers: number;
  expiringSoon: number;
};

/** Live subscriptions grouped by store product, most users first. */
export function productBreakdown(users: User[], soonDays = 7, now = Date.now()): ProductRow[] {
  const rows = new Map<string, ProductRow>();
  for (const u of users) {
    if (!hasLiveSubscription(u)) continue;
    const productId = u.subscriptionProductId?.trim() || "(unknown product)";
    const key = `${productId}|${u.subscriptionPlatform}|${u.plan}`;
    const row = rows.get(key) ?? {
      productId,
      platform: u.subscriptionPlatform,
      plan: u.plan,
      activeUsers: 0,
      expiringSoon: 0,
    };
    row.activeUsers++;
    if (u.subscriptionExpiresAt) {
      const left = new Date(u.subscriptionExpiresAt).getTime() - now;
      if (left >= 0 && left <= soonDays * DAY) row.expiringSoon++;
    }
    rows.set(key, row);
  }
  return [...rows.values()].sort((a, b) => b.activeUsers - a.activeUsers);
}

export function newestFirst(a: User, b: User) {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}
