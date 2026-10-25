"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { initials } from "@/lib/format";

type AvatarProps = { name: string; src?: string; size?: number; className?: string };

export function Avatar({ name, src, size = 40, className }: AvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string>();
  const style = { width: size, height: size, fontSize: Math.max(11, Math.round(size * 0.32)) };
  if (src && src !== failedSrc) {
    return (
      // Avatars come from the API host at arbitrary URLs; a plain img keeps that simple.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        style={style}
        onError={() => setFailedSrc(src)}
        className={cn("shrink-0 rounded-full bg-surface object-cover", className)}
      />
    );
  }
  return (
    <span
      style={style}
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-info/20 font-semibold text-info",
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
