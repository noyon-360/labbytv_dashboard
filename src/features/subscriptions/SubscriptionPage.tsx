"use client";

import { useMemo } from "react";
import { BadgeCheck, ChevronRight, Crown, Smartphone } from "lucide-react";
import { useUsers } from "@/api/users";
import { PlanBadge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { Alert, EmptyState, ErrorState, TableSkeleton } from "@/components/ui/States";
import { Table, Td, Th, Tr } from "@/components/ui/Table";
import { PageHeader } from "@/layout/PageHeader";
import { buttonClasses } from "@/components/ui/Button";
import { REVENUECAT_URL } from "@/lib/env";
import { formatNumber, formatPercent, PLATFORM_LABEL } from "@/lib/format";
import { ADMIN_GRANT_PRODUCT } from "@/lib/grants";
import { hasLiveSubscription, platformSplit, productBreakdown } from "@/lib/stats";

export function SubscriptionPage() {
  const { data: users, isPending, isError, error, refetch } = useUsers();

  const stats = useMemo(() => {
    if (!users) return null;
    const platforms = platformSplit(users);
    return {
      premium: users.filter((u) => u.plan === "premium").length,
      live: users.filter(hasLiveSubscription).length,
      platforms,
      products: productBreakdown(users),
    };
  }, [users]);

  const share = (n: number, of: number) => (of ? formatPercent((n / of) * 100, 0) : "0%");

  return (
    <>
      <PageHeader
        title="Subscription"
        crumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Subscription" }]}
        actions={
          <a href={REVENUECAT_URL} target="_blank" rel="noopener noreferrer" className={buttonClasses({ variant: "secondary" })}>
            Open RevenueCat
            <ChevronRight className="size-5" aria-hidden />
          </a>
        }
      />

      <Alert tone="info" className="mb-8 text-base">
        Plans and prices are managed in RevenueCat, App Store Connect and Google Play Console. This page shows who&apos;s subscribed
        to what.
      </Alert>

      {isError ? (
        <Card>
          <ErrorState title="Couldn't load subscriptions" error={error} onRetry={() => refetch()} />
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard icon={<Crown />} label="Premium users" loading={isPending} value={stats && formatNumber(stats.premium)} />
            <StatCard
              icon={<BadgeCheck />}
              label="Active subscriptions"
              loading={isPending}
              value={stats && formatNumber(stats.live)}
              note="active or in a trial"
            />
            <StatCard
              icon={<Smartphone />}
              label="Apple App Store"
              loading={isPending}
              value={stats && formatNumber(stats.platforms.apple)}
              note={stats && `${share(stats.platforms.apple, stats.platforms.total)} of active subscriptions`}
            />
            <StatCard
              icon={<Smartphone />}
              label="Google Play"
              loading={isPending}
              value={stats && formatNumber(stats.platforms.google)}
              note={stats && `${share(stats.platforms.google, stats.platforms.total)} of active subscriptions`}
            />
          </div>

          <div className="mt-8">
            {isPending ? (
              <div className="rounded-xl bg-surface">
                <TableSkeleton rows={4} cols={5} />
              </div>
            ) : !stats || stats.products.length === 0 ? (
              <Card>
                <EmptyState title="No active subscriptions" body="Store products will show up here once someone subscribes." />
              </Card>
            ) : (
              <Table>
                <thead>
                  <tr>
                    <Th>Product ID</Th>
                    <Th>Platform</Th>
                    <Th>Plan</Th>
                    <Th className="text-right">Active users</Th>
                    <Th className="text-right">Expiring in 7 days</Th>
                  </tr>
                </thead>
                <tbody>
                  {stats.products.map((p) => (
                    <Tr key={`${p.productId}|${p.platform}|${p.plan}`}>
                      <Td className="break-all">{p.productId}</Td>
                      <Td className="whitespace-nowrap text-fg-2">
                        <span className="inline-flex items-center gap-2">
                          <Smartphone className="size-4" aria-hidden />
                          {p.productId === ADMIN_GRANT_PRODUCT
                            ? "Admin grant"
                            : p.platform === "none"
                              ? "Unknown"
                              : PLATFORM_LABEL[p.platform]}
                        </span>
                      </Td>
                      <Td>
                        <PlanBadge plan={p.plan} />
                      </Td>
                      <Td className="text-right tabular-nums">{formatNumber(p.activeUsers)}</Td>
                      <Td className="text-right tabular-nums">{formatNumber(p.expiringSoon)}</Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            )}
          </div>

          <p className="mt-6 text-sm text-subtle">
            Counts come from each user&apos;s current subscription (plan, platform and product ID) in GET /admin/users.
          </p>
        </>
      )}
    </>
  );
}
