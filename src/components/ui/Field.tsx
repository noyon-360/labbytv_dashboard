"use client";

import { forwardRef, useId, useState } from "react";
import { ChevronDown, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/cn";

const control =
  "w-full rounded-lg border bg-transparent px-3 text-base text-fg placeholder:text-subtle transition-colors " +
  "focus:outline-none focus:border-brand disabled:cursor-not-allowed disabled:opacity-60";

function borderFor(error?: string) {
  return error ? "border-danger" : "border-line-input hover:border-line-strong";
}

type FieldShellProps = {
  label?: string;
  htmlFor: string;
  error?: string;
  hint?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
};

/** Label, control, then either the error or the helper text. */
export function FieldShell({ label, htmlFor, error, hint, className, children }: FieldShellProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label htmlFor={htmlFor} className="text-sm font-medium text-fg-2">
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p id={`${htmlFor}-msg`} role="alert" className="text-xs text-danger-fg">
          {error}
        </p>
      ) : hint ? (
        <p id={`${htmlFor}-msg`} className="text-xs text-subtle">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  hint?: React.ReactNode;
  trailing?: React.ReactNode;
  containerClassName?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, trailing, id, className, containerClassName, ...props },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <FieldShell label={label} htmlFor={inputId} error={error} hint={hint} className={containerClassName}>
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? `${inputId}-msg` : undefined}
          className={cn(control, "h-10", borderFor(error), trailing && "pr-10", className)}
          {...props}
        />
        {trailing && <div className="absolute inset-y-0 right-2 flex items-center text-muted">{trailing}</div>}
      </div>
    </FieldShell>
  );
});

export const PasswordInput = forwardRef<HTMLInputElement, Omit<InputProps, "type" | "trailing">>(
  function PasswordInput(props, ref) {
    const [visible, setVisible] = useState(false);
    return (
      <Input
        ref={ref}
        type={visible ? "text" : "password"}
        trailing={
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            className="rounded p-1 text-muted hover:text-fg focus-visible:outline-2 focus-visible:outline-brand"
            aria-label={visible ? "Hide password" : "Show password"}
          >
            {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        }
        {...props}
      />
    );
  },
);

type SelectProps = Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> & {
  label?: string;
  error?: string;
  hint?: React.ReactNode;
  options: { value: string; label: string }[];
  size?: "md" | "sm";
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, hint, options, id, className, size = "md", ...props },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <FieldShell label={label} htmlFor={inputId} error={error} hint={hint}>
      <div className="relative">
        <select
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          className={cn(
            control,
            "cursor-pointer appearance-none bg-canvas pr-9",
            size === "md" ? "h-10" : "h-9 text-sm",
            borderFor(error),
            className,
          )}
          {...props}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted" />
      </div>
    </FieldShell>
  );
});
