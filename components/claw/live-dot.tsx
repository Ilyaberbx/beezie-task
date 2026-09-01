"use client";

import { usePullArrivals } from "@/hooks/claw/use-live-recent-pulls";

export function LiveDot() {
  const arrivals = usePullArrivals();

  return (
    <span className="relative flex size-1.5 shrink-0 items-center justify-center">
      {arrivals > 0 && (
        <span
          key={arrivals}
          aria-hidden
          className="absolute size-1.5 rounded-full bg-primary animate-live-ping"
        />
      )}
      <span aria-hidden className="size-1.5 rounded-full bg-primary" />
      <span className="sr-only">Live</span>
    </span>
  );
}
