"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useAnyDialogOpen } from "@/components/ui/dialog";
import { usePrefersReducedMotion } from "@/hooks/use-media-query";
import { drawRecentPull } from "@/lib/claw/mock";
import { insertLivePull, settleLivePull, trimLivePulls } from "@/lib/claw/live-pulls";
import {
  livePullsStore,
  seedLivePulls,
  updateLivePulls,
} from "@/lib/claw/live-pulls-store";
import {
  createMockRecentPullsFeed,
  type RecentPullsFeed,
} from "@/lib/claw/recent-pulls-feed";
import type { RecentPull } from "@/lib/claw/types";

const defaultFeed = createMockRecentPullsFeed({ next: drawRecentPull });

const EXIT_MS = 480;
const REDUCED_EXIT_MS = 180;
const SETTLE_MS = 1200;

export function useLiveRecentPulls(
  initial: RecentPull[],
  feed: RecentPullsFeed = defaultFeed,
) {
  seedLivePulls(initial);
  const prefersReducedMotion = usePrefersReducedMotion();
  const dialogCoversTheFeed = useAnyDialogOpen();

  useEffect(() => {
    const exitMs = prefersReducedMotion ? REDUCED_EXIT_MS : EXIT_MS;

    const timers = new Set<ReturnType<typeof setTimeout>>();
    let unsubscribe: (() => void) | undefined;

    const receive = (pull: RecentPull) => {
      updateLivePulls((list) => insertLivePull(list, pull));

      const trim = setTimeout(() => {
        timers.delete(trim);
        updateLivePulls(trimLivePulls);
      }, exitMs);
      timers.add(trim);

      const settle = setTimeout(() => {
        timers.delete(settle);
        updateLivePulls((list) => settleLivePull(list, pull.id));
      }, SETTLE_MS);
      timers.add(settle);
    };

    const sync = () => {
      if (document.visibilityState === "visible" && !dialogCoversTheFeed) {
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
  }, [feed, prefersReducedMotion, dialogCoversTheFeed]);

  return useSyncExternalStore(
    livePullsStore.subscribe,
    livePullsStore.get,
    livePullsStore.getServer,
  );
}

