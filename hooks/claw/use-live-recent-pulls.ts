"use client";

import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/use-media-query";
import { drawRecentPull } from "@/lib/claw/mock";
import {
  createMockRecentPullsFeed,
  type RecentPullsFeed,
} from "@/lib/claw/recent-pulls-feed";
import type { RecentPull } from "@/lib/claw/types";

const defaultFeed = createMockRecentPullsFeed({ next: drawRecentPull });

export const PULL_WINDOW = 6;
const EXIT_MS = 480;
const REDUCED_EXIT_MS = 180;
const SETTLE_MS = 1200;

export type LivePull = RecentPull & { isLive: boolean };

export function useLiveRecentPulls(
  initial: RecentPull[],
  feed: RecentPullsFeed = defaultFeed,
) {
  const [pulls, setPulls] = useState<LivePull[]>(() =>
    initial.slice(0, PULL_WINDOW).map((pull) => ({ ...pull, isLive: false })),
  );
  const [arrivals, setArrivals] = useState(0);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const exitMs = prefersReducedMotion ? REDUCED_EXIT_MS : EXIT_MS;

    const timers = new Set<ReturnType<typeof setTimeout>>();
    let unsubscribe: (() => void) | undefined;

    const receive = (pull: RecentPull) => {
      setPulls((prev) => [{ ...pull, isLive: true }, ...prev].slice(0, PULL_WINDOW + 1));
      setArrivals((count) => count + 1);

      const trim = setTimeout(() => {
        timers.delete(trim);
        setPulls((prev) => prev.slice(0, PULL_WINDOW));
      }, exitMs);
      timers.add(trim);

      const settle = setTimeout(() => {
        timers.delete(settle);
        setPulls((prev) =>
          prev.map((row) => (row.id === pull.id ? { ...row, isLive: false } : row)),
        );
      }, SETTLE_MS);
      timers.add(settle);
    };

    const sync = () => {
      if (document.visibilityState === "visible") {
        unsubscribe ??= feed.subscribe(receive);
      } else {
        unsubscribe?.();
        unsubscribe = undefined;
      }
    };

    sync();
    document.addEventListener("visibilitychange", sync);

    return () => {
      document.removeEventListener("visibilitychange", sync);
      unsubscribe?.();
      for (const timer of timers) clearTimeout(timer);
      timers.clear();
    };
  }, [feed, prefersReducedMotion]);

  return { pulls, arrivals };
}
