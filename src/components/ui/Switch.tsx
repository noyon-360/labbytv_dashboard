"use client";

import { cn } from "@/lib/cn";

type SwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
  id?: string;
  className?: string;
};

/** Red track when on, with a white knob. */
export function Switch({ checked, onChange, label, disabled, id, className }: SwitchProps) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-50",
        checked ? "bg-brand" : "bg-line",
        className,
      )}
    >
      <span
        className={cn(
          "inline-block size-[18px] rounded-full transition-transform",
          checked ? "translate-x-[23px] bg-on-brand" : "translate-x-[3px] bg-muted",
        )}
      />
    </button>
  );
}
