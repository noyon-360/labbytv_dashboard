"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatNumber, formatPercent } from "@/lib/format";

export type DonutSlice = { key: string; label: string; value: number; color: string };

/**
 * Part-to-whole donut with a legend that carries every label, count and share, so
 * identity never depends on color alone. Built generic so the "Most watching" card
 * can switch from plans to genres once the backend stores genre data.
 */
export function DonutChart({ data, centerLabel, ariaLabel }: { data: DonutSlice[]; centerLabel: string; ariaLabel: string }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const share = (v: number) => (total ? formatPercent((v / total) * 100) : "0%");

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center xl:flex-col 2xl:flex-row">
      <figure className="relative size-[200px] shrink-0" aria-label={ariaLabel}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={total ? data : [{ key: "empty", label: "No users", value: 1, color: "#3a3a3a" }]}
              dataKey="value"
              nameKey="label"
              innerRadius={68}
              outerRadius={96}
              paddingAngle={total && data.filter((d) => d.value > 0).length > 1 ? 1.5 : 0}
              stroke="var(--color-surface)"
              strokeWidth={2}
              startAngle={90}
              endAngle={-270}
              isAnimationActive={false}
            >
              {(total ? data : [{ key: "empty", color: "#3a3a3a" }]).map((d) => (
                <Cell key={d.key} fill={d.color} />
              ))}
            </Pie>
            {total > 0 && (
              <Tooltip
                cursor={false}
                content={({ active, payload }) => {
                  const p = payload?.[0]?.payload as DonutSlice | undefined;
                  if (!active || !p) return null;
                  return (
                    <div className="rounded-lg border border-line bg-chrome px-3 py-2 text-sm shadow-modal">
                      <p className="flex items-center gap-2 font-medium">
                        <span className="size-2.5 rounded-full" style={{ background: p.color }} aria-hidden />
                        {p.label}
                      </p>
                      <p className="mt-1 text-fg-2 tabular-nums">
                        {formatNumber(p.value)} · {share(p.value)}
                      </p>
                    </div>
                  );
                }}
              />
            )}
          </PieChart>
        </ResponsiveContainer>
        <figcaption className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl leading-none font-semibold">{formatNumber(total)}</span>
          <span className="mt-1 text-xs text-muted">{centerLabel}</span>
        </figcaption>
      </figure>

      <ul className="flex w-full min-w-0 flex-col gap-3">
        {data.map((d) => (
          <li key={d.key} className="flex items-center gap-3 text-base">
            <span className="size-3 shrink-0 rounded-full" style={{ background: d.color }} aria-hidden />
            <span className="min-w-0 flex-1 truncate text-fg-2">{d.label}</span>
            <span className="font-medium tabular-nums">{formatNumber(d.value)}</span>
            <span className="w-14 text-right text-sm text-muted tabular-nums">{share(d.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
