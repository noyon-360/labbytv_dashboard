"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useUsers } from "@/api/users";
import { Card } from "@/components/ui/Card";
import { FilterTabs } from "@/components/ui/FilterTabs";
import { Input, Select } from "@/components/ui/Field";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyState, ErrorState, NoResults, TableSkeleton } from "@/components/ui/States";
import { PageHeader } from "@/layout/PageHeader";
import { newestFirst } from "@/lib/stats";
import type { Plan } from "@/types/api";
import { UsersTable } from "./UsersTable";

const PAGE_SIZE = 25;
type PlanFilter = "all" | Plan;
type Sort = "newest" | "oldest";

export function UserListPage() {
  const { data: users, isPending, isError, error, refetch } = useUsers();
  const [query, setQuery] = useState("");
  const [plan, setPlan] = useState<PlanFilter>("all");
  const [sort, setSort] = useState<Sort>("newest");
  const [page, setPage] = useState(1);
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());

  const counts = useMemo(() => {
    const c = { all: 0, free: 0, basic: 0, premium: 0 };
    users?.forEach((u) => {
      c.all++;
      c[u.plan] = (c[u.plan] ?? 0) + 1;
    });
    return c;
  }, [users]);

  const filtered = useMemo(() => {
    if (!users) return [];
    const out = users.filter(
      (u) =>
        (plan === "all" || u.plan === plan) &&
        (!deferredQuery ||
          u.name?.toLowerCase().includes(deferredQuery) ||
          u.email.toLowerCase().includes(deferredQuery)),
    );
    out.sort(newestFirst);
    if (sort === "oldest") out.reverse();
    return out;
  }, [users, plan, deferredQuery, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const clear = () => {
    setQuery("");
    setPlan("all");
    setPage(1);
  };

  return (
    <>
      <PageHeader title="User Management" crumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "User Management" }]} />

      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <Input
          label="Search"
          type="search"
          placeholder="Search by name or email"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          trailing={<Search className="size-5" aria-hidden />}
          containerClassName="w-full lg:max-w-[380px]"
        />
        <div className="flex flex-wrap items-center gap-3">
          <FilterTabs
            label="Filter by plan"
            value={plan}
            onChange={(v) => {
              setPlan(v);
              setPage(1);
            }}
            tabs={[
              { value: "all", label: "All", count: counts.all },
              { value: "free", label: "Free", count: counts.free },
              { value: "basic", label: "Basic", count: counts.basic },
              { value: "premium", label: "Premium", count: counts.premium },
            ]}
          />
          <div className="w-44">
            <Select
              aria-label="Sort by date added"
              size="sm"
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              options={[
                { value: "newest", label: "Newest first" },
                { value: "oldest", label: "Oldest first" },
              ]}
              className="rounded-full"
            />
          </div>
        </div>
      </div>

      {isError ? (
        <Card>
          <ErrorState title="Couldn't load users" error={error} onRetry={() => refetch()} />
        </Card>
      ) : isPending ? (
        <div className="rounded-xl bg-surface">
          <TableSkeleton rows={8} cols={5} />
        </div>
      ) : users.length === 0 ? (
        <Card>
          <EmptyState title="No users yet" body="People who sign up in the app will show up here." />
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <NoResults query={query.trim()} hint="Try a different name or email, or another plan." onClear={clear} />
        </Card>
      ) : (
        <>
          <UsersTable users={rows} />
          <div className="mt-6">
            <Pagination
              page={current}
              pageSize={PAGE_SIZE}
              total={filtered.length}
              onChange={(p) => {
                setPage(p);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          </div>
        </>
      )}
    </>
  );
}
