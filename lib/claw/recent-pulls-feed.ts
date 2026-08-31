import type { RecentPull } from "./types";

export type RecentPullsFeed = {
  subscribe(onPull: (pull: RecentPull) => void): () => void;
};

export type MockFeedOptions = {
  next: () => RecentPull;
  minDelayMs?: number;
  maxDelayMs?: number;
};

export function createMockRecentPullsFeed({
  next,
  minDelayMs = 3000,
  maxDelayMs = 7000,
}: MockFeedOptions): RecentPullsFeed {
  return {
    subscribe(onPull) {
      let timer: ReturnType<typeof setTimeout> | undefined;
      let live = true;

      const schedule = () => {
        timer = setTimeout(() => {
          onPull(next());
          if (live) schedule();
        }, minDelayMs + Math.random() * (maxDelayMs - minDelayMs));
      };

      schedule();

      return () => {
        live = false;
        clearTimeout(timer);
      };
    },
  };
}
