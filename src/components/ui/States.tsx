import { Inbox, RefreshCw, Search, TriangleAlert, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { getErrorMessage } from "@/api/client";
import { Button } from "./Button";

function StateFrame({ icon, title, body, action, tone = "neutral", className }: {
  icon: React.ReactNode;
  title: string;
  body?: React.ReactNode;
  action?: React.ReactNode;
  tone?: "neutral" | "danger";
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center px-6 py-16 text-center", className)}>
      <span
        className={cn(
          "mb-4 inline-flex size-14 items-center justify-center rounded-full",
          tone === "danger" ? "bg-danger/20 text-danger" : "bg-white/10 text-fg-2",
        )}
      >
        {icon}
      </span>
      <p className="text-xl font-medium">{title}</p>
      {body && <p className="mt-3 max-w-md text-base text-fg-2">{body}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function EmptyState({ title, body, className }: { title: string; body?: React.ReactNode; className?: string }) {
  return <StateFrame icon={<Inbox className="size-6" />} title={title} body={body} className={className} />;
}

export function NoResults({ query, hint, onClear }: { query: string; hint: string; onClear: () => void }) {
  return (
    <StateFrame
      icon={<Search className="size-6" />}
      title={query ? `No results for “${query}”` : "Nothing matches these filters"}
      body={hint}
      action={
        <Button variant="secondary" size="sm" onClick={onClear} icon={<X className="size-4" />}>
          Clear filters
        </Button>
      }
    />
  );
}

export function ErrorState({ title, error, onRetry, className }: {
  title: string;
  error?: unknown;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <StateFrame
      tone="danger"
      icon={<TriangleAlert className="size-6" />}
      title={title}
      body={error ? getErrorMessage(error) : "Check your connection and try again."}
      action={
        onRetry && (
          <Button size="sm" onClick={onRetry} icon={<RefreshCw className="size-4" />}>
            Try again
          </Button>
        )
      }
      className={className}
    />
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-full bg-white/10", className)} aria-hidden />;
}

export function TableSkeleton({ rows = 6, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-5 p-6" role="status" aria-label="Loading">
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} className="flex gap-6">
          {Array.from({ length: cols }, (_, c) => (
            <Skeleton key={c} className={cn("h-3", c === cols - 1 ? "w-12" : "flex-1")} />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Inline alert strip (info or danger), e.g. "Plans and prices are managed in RevenueCat". */
export function Alert({ tone = "info", children, className }: {
  tone?: "info" | "danger" | "success";
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      role={tone === "danger" ? "alert" : undefined}
      className={cn(
        "flex items-start gap-3 rounded-lg px-4 py-3 text-sm leading-relaxed",
        tone === "info" && "bg-info/12 text-fg-2",
        tone === "danger" && "bg-danger/15 text-fg-2",
        tone === "success" && "bg-success/12 text-fg-2",
        className,
      )}
    >
      <TriangleAlert
        className={cn(
          "mt-0.5 size-4 shrink-0",
          tone === "info" && "text-info",
          tone === "danger" && "text-danger",
          tone === "success" && "text-success-fg",
        )}
        aria-hidden
      />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
