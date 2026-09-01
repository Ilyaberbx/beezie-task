import { seedLivePullWindow, type LivePull } from "./live-pulls.ts";
import type { RecentPull } from "./types";

type Listener = () => void;

const listeners = new Set<Listener>();
let pulls: LivePull[] = [];
let seeded = false;

export const livePullsStore = {
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  get: () => pulls,
  getServer: () => pulls,
};

export function seedLivePulls(initial: RecentPull[]) {
  if (seeded) return;
  seeded = true;
  pulls = seedLivePullWindow(initial);
}

export function updateLivePulls(update: (list: LivePull[]) => LivePull[]) {
  const next = update(pulls);
  if (next === pulls) return;
  pulls = next;
  for (const listener of listeners) listener();
}
