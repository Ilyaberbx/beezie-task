import type { RecentPull } from "./types";

export type RecentPullsFeed = {
  /** Starts delivering pulls as they happen. Returns the unsubscribe. */
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
        // Jitter, not a metronome: a real feed never arrives on the beat.
        timer = setTimeout(() => {
          onPull(next());
          // onPull may have unsubscribed us; rescheduling then would be unstoppable.
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
