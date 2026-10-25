"use client";

import { useEffect, useId, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  icon?: React.ReactNode;
  /** Hide the corner close button (used by confirm dialogs that have their own Cancel). */
  hideClose?: boolean;
  className?: string;
  children: React.ReactNode;
};

export function Modal({ open, onClose, title, icon, hideClose, className, children }: ModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  // Next keeps hidden routes mounted (Activity); close the dialog when its page is hidden.
  useLayoutEffect(() => () => onCloseRef.current(), []);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    const focusables = () =>
      Array.from(
        panel?.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );
    (panel?.querySelector<HTMLElement>("[data-autofocus]") ?? focusables()[0] ?? panel)?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onCloseRef.current();
      }
      if (e.key === "Tab") {
        const items = focusables();
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      previouslyFocused?.focus?.();
    };
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} aria-hidden />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          "relative max-h-[calc(100dvh-2rem)] w-full max-w-[520px] overflow-y-auto rounded-xl bg-surface p-6 shadow-modal focus:outline-none",
          className,
        )}
      >
        {icon && <div className="mb-4">{icon}</div>}
        <div className="mb-6 flex items-start justify-between gap-4">
          <h2 id={titleId} className="text-2xl font-semibold">
            {title}
          </h2>
          {!hideClose && (
            <button
              type="button"
              onClick={onClose}
              className="-m-1 rounded p-1 text-muted hover:text-fg focus-visible:outline-2 focus-visible:outline-brand"
              aria-label="Close"
            >
              <X className="size-6" />
            </button>
          )}
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}

/** Round red badge with a warning icon, used at the top of destructive dialogs. */
export function DangerIcon({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex size-12 items-center justify-center rounded-full bg-danger/20 text-danger">
      {children}
    </span>
  );
}
