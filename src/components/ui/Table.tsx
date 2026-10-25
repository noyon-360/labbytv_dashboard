import { cn } from "@/lib/cn";

/** The dark table card: header row on the surface, rows split by hairlines. Scrolls sideways on small screens. */
export function Table({ children, className, minWidth = 720 }: { children: React.ReactNode; className?: string; minWidth?: number }) {
  return (
    <div className={cn("overflow-hidden rounded-xl bg-surface", className)}>
      <div className="relative overflow-x-auto">
        <table className="w-full border-collapse text-left" style={{ minWidth }}>{children}</table>
      </div>
    </div>
  );
}

export function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <th scope="col" className={cn("border-b border-line px-4 py-3 text-sm font-medium text-muted whitespace-nowrap", className)}>
      {children}
    </th>
  );
}

export function Td({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <td className={cn("px-4 py-3 align-middle text-base", className)}>{children}</td>;
}

export function Tr({ children, className }: { children: React.ReactNode; className?: string }) {
  return <tr className={cn("border-b border-line last:border-b-0", className)}>{children}</tr>;
}
