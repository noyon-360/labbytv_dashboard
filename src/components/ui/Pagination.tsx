"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";

/** Page numbers to show: first, last, current ±1, with gaps as null. */
function pageList(page: number, pages: number): (number | null)[] {
  const wanted = new Set([1, pages, page - 1, page, page + 1].filter((p) => p >= 1 && p <= pages));
  const sorted = [...wanted].sort((a, b) => a - b);
  const out: (number | null)[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push(null);
    out.push(p);
  });
  return out;
}

export function Pagination({ page, pageSize, total, onChange }: {
  page: number;
  pageSize: number;
  total: number;
  onChange: (page: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  const btn =
    "inline-flex size-9 items-center justify-center rounded-full text-sm transition-colors focus-visible:outline-2 focus-visible:outline-brand disabled:opacity-40 disabled:pointer-events-none";

  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-between gap-4 text-sm text-subtle">
      <p className="tabular-nums">
        Showing {formatNumber(from)}–{formatNumber(to)} of {formatNumber(total)}
      </p>
      {pages > 1 && (
        <div className="flex items-center gap-1">
          <button type="button" className={cn(btn, "text-fg-2 hover:bg-white/5")} onClick={() => onChange(page - 1)} disabled={page <= 1} aria-label="Previous page">
            <ChevronLeft className="size-4" />
          </button>
          {pageList(page, pages).map((p, i) =>
            p === null ? (
              <span key={`gap-${i}`} className="px-1">
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => onChange(p)}
                aria-current={p === page ? "page" : undefined}
                className={cn(btn, "tabular-nums", p === page ? "bg-nav-active text-fg" : "text-fg-2 hover:bg-white/5")}
              >
                {p}
              </button>
            ),
          )}
          <button type="button" className={cn(btn, "text-fg-2 hover:bg-white/5")} onClick={() => onChange(page + 1)} disabled={page >= pages} aria-label="Next page">
            <ChevronRight className="size-4" />
          </button>
        </div>
      )}
    </nav>
  );
}
