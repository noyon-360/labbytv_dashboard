import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { PlanBadge, StatusBadge } from "@/components/ui/Badge";
import { Table, Td, Th, Tr } from "@/components/ui/Table";
import { displayName, formatDate } from "@/lib/format";
import type { User } from "@/types/api";

/** `compact` drops the subscription column and the email truncates sooner, for the dashboard's narrower card. */
export function UsersTable({ users, compact = false }: { users: User[]; compact?: boolean }) {
  const showStatus = !compact;
  return (
    <Table minWidth={compact ? 600 : 760}>
      <thead>
        <tr>
          <Th>Name</Th>
          <Th>Mail</Th>
          <Th>Added</Th>
          <Th>Plan</Th>
          {showStatus && <Th>Subscription</Th>}
          <Th className="text-right">
            <span className="sr-only">Action</span>
          </Th>
        </tr>
      </thead>
      <tbody>
        {users.map((u) => {
          const name = displayName(u);
          return (
            <Tr key={u._id} className="hover:bg-white/[0.02]">
              <Td>
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar name={name} src={u.avatar?.url} size={36} />
                  <span className={compact ? "max-w-[140px] truncate" : "max-w-[220px] truncate"}>{name}</span>
                  {u.role === "admin" && <span className="rounded-full bg-brand/15 px-2 py-0.5 text-xs text-brand-fg">Admin</span>}
                </div>
              </Td>
              <Td className={compact ? "max-w-[180px] truncate text-fg-2" : "max-w-[260px] truncate text-fg-2"}>{u.email}</Td>
              <Td className="whitespace-nowrap text-fg-2 tabular-nums">{formatDate(u.createdAt)}</Td>
              <Td>
                <PlanBadge plan={u.plan} />
              </Td>
              {showStatus && (
                <Td>
                  <StatusBadge status={u.subscriptionStatus} />
                </Td>
              )}
              <Td className="text-right">
                <Link
                  href={`/users/${u._id}`}
                  className="inline-flex h-9 items-center rounded-full bg-view px-5 text-sm font-medium text-on-brand transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                  aria-label={`View ${name}`}
                >
                  View
                </Link>
              </Td>
            </Tr>
          );
        })}
      </tbody>
    </Table>
  );
}
