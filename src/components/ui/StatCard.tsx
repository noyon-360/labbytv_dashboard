import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/cn";
import { Skeleton } from "./States";

type StatCardProps = {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  /** Signed change; up is treated as good. */
  delta?: { text: string; direction: "up" | "down" | "flat" };
  note?: React.ReactNode;
  loading?: boolean;
  className?: string;
};

export function StatCard({ icon, label, value, delta, note, loading, className }: StatCardProps) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-2 rounded-lg bg-surface p-4", className)}>
      <p className="flex items-center gap-2 text-sm text-muted">
        <span className="text-muted [&_svg]:size-4" aria-hidden>
          {icon}
        </span>
        <span className="truncate">{label}</span>
      </p>
      {loading ? (
        <>
          <Skeleton className="my-1.5 h-7 w-24" />
          <Skeleton className="h-2.5 w-36" />
        </>
      ) : (
        <>
          <p className="text-[26px] leading-[1.2] font-semibold">{value}</p>
          {(delta || note) && (
            <p className="flex flex-wrap items-center gap-1.5 text-xs text-subtle">
              {delta && (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 font-medium",
                    delta.direction === "up" && "text-success-fg",
                    delta.direction === "down" && "text-danger-fg",
                    delta.direction === "flat" && "text-muted",
                  )}
                >
                  {delta.text}
                  {delta.direction === "up" && <TrendingUp className="size-3.5" aria-label="up" />}
                  {delta.direction === "down" && <TrendingDown className="size-3.5" aria-label="down" />}
                </span>
              )}
              {note}
            </p>
          )}
        </>
      )}
    </div>
  );
}
