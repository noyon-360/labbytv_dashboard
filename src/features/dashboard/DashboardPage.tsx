"use client";

import { useMemo } from "react";
import { ChevronRight, Crown, Smartphone, UserRound, BadgeCheck } from "lucide-react";
import { useUsers } from "@/api/users";
import { Card, CardTitle } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/StatCard";
import { EmptyState, ErrorState, Skeleton, TableSkeleton } from "@/components/ui/States";
import { DonutChart, type DonutSlice } from "@/components/charts/DonutChart";
import { PageHeader } from "@/layout/PageHeader";
import { formatNumber, formatPercent, PLAN_LABEL } from "@/lib/format";
import { hasLiveSubscription, newestFirst, planBreakdown, platformSplit, signupGrowth } from "@/lib/stats";
import { UsersTable } from "@/features/users/UsersTable";

// Categorical order is fixed by plan so a plan keeps its color everywhere.
const PLAN_COLOR = { free: "var(--color-series-1)", basic: "var(--color-series-2)", premium: "var(--color-series-3)" };

export function DashboardPage() {
  const { data: users, isPending, isError, error, refetch } = useUsers();

  const stats = useMemo(() => {
    if (!users) return null;
    const growth = signupGrowth(users, 30);
    return {
      total: users.length,
      growth,
      premium: users.filter((u) => u.plan === "premium").length,
      live: users.filter(hasLiveSubscription).length,
      platforms: platformSplit(users),
      plans: planBreakdown(users).map<DonutSlice>(({ plan, count }) => ({
        key: plan,
        label: PLAN_LABEL[plan],
        value: count,
        color: PLAN_COLOR[plan],
      })),
      latest: [...users].sort(newestFirst).slice(0, 5),
    };
  }, [users]);

  const share = (n: number, of: number) => (of ? formatPercent((n / of) * 100, 0) : "0%");

  return (
    <>
      <PageHeader title="Dashboard" />

      {isError ? (
        <Card>
          <ErrorState title="Couldn't load the dashboard" error={error} onRetry={() => refetch()} />
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={<UserRound />}
              label="Total users"
              loading={isPending}
              value={stats && formatNumber(stats.total)}
              delta={stats?.growth.delta}
              note={stats && `${formatNumber(stats.growth.current)} sign-ups in 30 days vs the 30 before`}
            />
            <StatCard
              icon={<Crown />}
              label="Premium users"
              loading={isPending}
              value={stats && formatNumber(stats.premium)}
              note={stats && `${share(stats.premium, stats.total)} of all users`}
            />
            <StatCard
              icon={<BadgeCheck />}
              label="Active subscriptions"
              loading={isPending}
              value={stats && formatNumber(stats.live)}
              note="active or in a trial"
            />
            <StatCard
              icon={<Smartphone />}
              label="iOS vs Android"
              loading={isPending}
              value={
                stats && (
                  <span className="tabular-nums">
                    {formatNumber(stats.platforms.apple)}
                    <span className="mx-2 text-muted">/</span>
                    {formatNumber(stats.platforms.google)}
                  </span>
                )
              }
              note="App Store / Google Play subscriptions"
            />
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <section aria-labelledby="latest-users" className="min-w-0">
              <div className="mb-4 flex items-center justify-between gap-4">
                <h2 id="latest-users" className="text-2xl font-medium">
                  User list
                </h2>
                <ButtonLink href="/users" variant="secondary" size="sm" icon={<ChevronRight className="size-4" />}>
                  See all
                </ButtonLink>
              </div>
              {isPending ? (
                <div className="rounded-xl bg-surface">
                  <TableSkeleton rows={5} cols={4} />
                </div>
              ) : stats && stats.latest.length > 0 ? (
                <UsersTable users={stats.latest} compact />
              ) : (
                <Card>
                  <EmptyState title="No users yet" body="People who sign up in the app will show up here." />
                </Card>
              )}
            </section>

            <Card className="h-fit">
              <CardTitle>Users by plan</CardTitle>
              {isPending || !stats ? (
                <div className="flex flex-col items-center gap-6">
                  <Skeleton className="size-[200px]" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-full" />
                </div>
              ) : (
                <DonutChart data={stats.plans} centerLabel="users" ariaLabel="Users by plan" />
              )}
              <p className="mt-6 text-xs leading-relaxed text-subtle">
                &ldquo;Most watching&rdquo; by genre needs genre data in watch history, which the API doesn&apos;t store yet.
              </p>
            </Card>
          </div>
        </>
      )}
    </>
  );
}
