import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type Crumb = { label: string; href?: string };

/** H3 page title with the breadcrumb under it and actions on the right. */
export function PageHeader({ title, crumbs, actions }: { title: string; crumbs?: Crumb[]; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div className="min-w-0">
        <h1 className="text-[22px] leading-[1.25] font-semibold break-words sm:text-2xl">{title}</h1>
        {crumbs && crumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mt-1">
            <ol className="flex flex-wrap items-center gap-1 text-sm text-muted">
              {crumbs.map((c, i) => (
                <li key={`${c.label}-${i}`} className="flex min-w-0 items-center gap-1">
                  {i > 0 && <ChevronRight className="size-3.5 shrink-0 text-muted" aria-hidden />}
                  {c.href ? (
                    <Link href={c.href} className="truncate rounded hover:text-fg focus-visible:outline-2 focus-visible:outline-brand">
                      {c.label}
                    </Link>
                  ) : (
                    <span aria-current="page" className="truncate">
                      {c.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-3 md:pt-0.5">{actions}</div>}
    </div>
  );
}
