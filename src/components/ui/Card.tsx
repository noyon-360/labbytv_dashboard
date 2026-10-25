import { cn } from "@/lib/cn";

export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <section className={cn("rounded-xl bg-surface p-6", className)} {...props}>
      {children}
    </section>
  );
}

export function CardTitle({ children, className, action }: { children: React.ReactNode; className?: string; action?: React.ReactNode }) {
  return (
    <div className={cn("mb-4 flex items-center justify-between gap-4", className)}>
      <h2 className="text-lg font-semibold">{children}</h2>
      {action}
    </div>
  );
}

/** A label over a value, as on the user detail and profile screens. */
export function Detail({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("min-w-0", className)}>
      <dt className="text-sm text-subtle">{label}</dt>
      <dd className="mt-1.5 text-base break-words text-fg">{children}</dd>
    </div>
  );
}
