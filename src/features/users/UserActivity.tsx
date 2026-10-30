"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { useUserSubscriptionHistory, useUserWatchHistory, WATCH_HISTORY_PAGE_SIZE } from "@/api/users";
import { Badge, SubscriptionHistoryBadge } from "@/components/ui/Badge";
import { Card, CardTitle } from "@/components/ui/Card";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState, ErrorState, TableSkeleton } from "@/components/ui/States";
import { Table, Td, Th, Tr } from "@/components/ui/Table";
import { cn } from "@/lib/cn";
import { formatDate, formatDateTime, PLATFORM_LABEL, VIDEO_TYPE_LABEL } from "@/lib/format";
import type { WatchHistoryItem } from "@/types/api";

// The backend stores this placeholder (typo included) when the app sends no title.
const MISSING_TITLE = "no title foudn";

export function SubscriptionHistoryCard({ userId }: { userId: string }) {
  const { data: history, isPending, isError, error, refetch } = useUserSubscriptionHistory(userId);

  return (
    <Card>
      <CardTitle className="mb-1">Subscription History</CardTitle>
      <p className="mb-4 text-sm text-muted">Store purchases only. Premium granted from this dashboard isn&apos;t recorded here.</p>
      {isError ? (
        <ErrorState title="Couldn't load subscription history" error={error} onRetry={() => refetch()} className="py-8!" />
      ) : isPending ? (
        <TableSkeleton rows={3} cols={4} />
      ) : history.length === 0 ? (
        <EmptyState title="No store purchases" className="py-8!" />
      ) : (
        <Table minWidth={560} className="-mx-4">
          <thead>
            <tr>
              <Th>Product</Th>
              <Th>Platform</Th>
              <Th>Status</Th>
              <Th>Started</Th>
              <Th>Expires</Th>
            </tr>
          </thead>
          <tbody>
            {history.map((item) => (
              <Tr key={item._id}>
                <Td className="max-w-[200px] truncate">{item.productId}</Td>
                <Td className="whitespace-nowrap text-fg-2">{PLATFORM_LABEL[item.platform] ?? item.platform}</Td>
                <Td>
                  <SubscriptionHistoryBadge status={item.status} />
                </Td>
                <Td className="whitespace-nowrap text-fg-2 tabular-nums">{formatDate(item.startDate)}</Td>
                <Td className="whitespace-nowrap text-fg-2 tabular-nums">{formatDate(item.expiresAt)}</Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      )}
    </Card>
  );
}

export function WatchHistoryCard({ userId }: { userId: string }) {
  const [page, setPage] = useState(1);
  const { data, isPending, isPlaceholderData, isError, error, refetch } = useUserWatchHistory(userId, page);

  return (
    <Card>
      <CardTitle className="mb-1">Watch History</CardTitle>
      <p className="mb-4 text-sm text-muted">The latest state of each title, not every viewing session.</p>
      {isError ? (
        <ErrorState title="Couldn't load watch history" error={error} onRetry={() => refetch()} className="py-8!" />
      ) : isPending ? (
        <TableSkeleton rows={4} cols={4} />
      ) : data.pagination.totalItems === 0 ? (
        <EmptyState title="Nothing watched yet" className="py-8!" />
      ) : (
        <div className={cn("space-y-4 transition-opacity", isPlaceholderData && "opacity-60")}>
          <Table minWidth={560} className="-mx-4">
            <thead>
              <tr>
                <Th>Title</Th>
                <Th>Type</Th>
                <Th>Progress</Th>
                <Th>Last activity</Th>
              </tr>
            </thead>
            <tbody>
              {data.history.map((item) => (
                <Tr key={item._id}>
                  <Td>
                    <div className="flex items-center gap-2">
                      <span className="max-w-[260px] truncate">{item.title === MISSING_TITLE ? "Untitled" : item.title}</span>
                      {item.isLoved && (
                        <>
                          <Heart className="size-4 shrink-0 fill-current text-brand-fg" aria-hidden />
                          <span className="sr-only">Favorite</span>
                        </>
                      )}
                    </div>
                    {episodeLabel(item) && <p className="mt-0.5 text-sm text-muted">{episodeLabel(item)}</p>}
                  </Td>
                  <Td className="whitespace-nowrap text-fg-2">{VIDEO_TYPE_LABEL[item.videoType] ?? item.videoType}</Td>
                  <Td className="whitespace-nowrap text-fg-2 tabular-nums">
                    <Progress item={item} />
                  </Td>
                  <Td className="whitespace-nowrap text-fg-2 tabular-nums">{formatDateTime(item.lastWatchedAt)}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
          <Pagination page={page} pageSize={WATCH_HISTORY_PAGE_SIZE} total={data.pagination.totalItems} onChange={setPage} />
        </div>
      )}
    </Card>
  );
}

function episodeLabel(item: WatchHistoryItem): string | null {
  const parts = [
    item.seasonNumber != null && `Season ${item.seasonNumber}`,
    item.episodeNumber != null && `Episode ${item.episodeNumber}`,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : null;
}

/** Live channels and rows created only by favoriting have no duration, so a percentage would mean nothing. */
function Progress({ item }: { item: WatchHistoryItem }) {
  if (item.isCompleted) return <Badge tone="success">Completed</Badge>;
  if (item.duration > 0) return <>{item.progressPercentage}%</>;
  return <>—</>;
}
