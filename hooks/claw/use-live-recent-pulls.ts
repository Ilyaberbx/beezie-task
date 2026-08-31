"use client";

import { useEffect, useState } from "react";
import { drawRecentPull } from "@/lib/claw/mock";
import {
  createMockRecentPullsFeed,
  type RecentPullsFeed,
} from "@/lib/claw/recent-pulls-feed";
import type { RecentPull } from "@/lib/claw/types";

// Swap point for the real transport: a createSocketRecentPullsFeed(url) keeping the same
// subscribe contract — onmessage -> onPull(JSON.parse(event.data)), close on unsubscribe.
const defaultFeed = createMockRecentPullsFeed({ next: drawRecentPull });

/** Rows held on screen. A row past the window is mid-dissolve and about to be dropped. */
export const PULL_WINDOW = 6;
const EXIT_MS = 480;
const SETTLE_MS = 1200; // outlasts the entrance and its gold flash

export type LivePull = RecentPull & { isLive: boolean };

export function useLiveRecentPulls(
  initial: RecentPull[],
  feed: RecentPullsFeed = defaultFeed,
) {
  const [pulls, setPulls] = useState<LivePull[]>(() =>
    initial.slice(0, PULL_WINDOW).map((pull) => ({ ...pull, isLive: false })),
  );
  const [arrivals, setArrivals] = useState(0);

  useEffect(() => {
    const timers = new Set<ReturnType<typeof setTimeout>>();
    let unsubscribe: (() => void) | undefined;

    const receive = (pull: RecentPull) => {
      setPulls((prev) => [{ ...pull, isLive: true }, ...prev].slice(0, PULL_WINDOW + 1));
      setArrivals((count) => count + 1);

      const trim = setTimeout(() => {
        timers.delete(trim);
        setPulls((prev) => prev.slice(0, PULL_WINDOW));
      }, EXIT_MS);
      timers.add(trim);

      // Once the entrance has played out, stop claiming the row is still arriving.
      const settle = setTimeout(() => {
        timers.delete(settle);
        setPulls((prev) =>
          prev.map((row) => (row.id === pull.id ? { ...row, isLive: false } : row)),
        );
      }, SETTLE_MS);
      timers.add(settle);
    };

    // A hidden tab should not bank up arrivals it will dump on return.
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
  }, [feed]);

  return { pulls, arrivals };
}
