"use client";

import { cn } from "@/lib/cn";

type Tab<T extends string> = { value: T; label: string; count?: number };

/** Segmented pill control; the active tab is the dark gray nav-active pill. */
export function FilterTabs<T extends string>({ tabs, value, onChange, label }: {
  tabs: Tab<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex max-w-full flex-wrap gap-1 rounded-full border border-line-input p-1">
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(tab.value)}
            className={cn(
              "rounded-full px-4 py-2 text-sm whitespace-nowrap transition-colors",
              "focus-visible:outline-2 focus-visible:outline-brand",
              active ? "bg-nav-active text-fg" : "text-fg-2 hover:text-fg",
            )}
          >
            {tab.label}
            {tab.count !== undefined && <span className="tabular-nums"> ({tab.count})</span>}
          </button>
        );
      })}
    </div>
  );
}
