import type { RecentPull } from "./types";

export const PULL_WINDOW = 6;

export type LivePull = RecentPull & { isLive: boolean };

export function seedLivePullWindow(initial: RecentPull[]): LivePull[] {
  return initial.slice(0, PULL_WINDOW).map((pull) => ({ ...pull, isLive: false }));
}

export function insertLivePull(list: LivePull[], pull: RecentPull): LivePull[] {
  return [{ ...pull, isLive: true }, ...list].slice(0, PULL_WINDOW + 1);
}

export function trimLivePulls(list: LivePull[]): LivePull[] {
  return list.slice(0, PULL_WINDOW);
}

export function settleLivePull(list: LivePull[], id: string): LivePull[] {
  return list.map((row) => (row.id === id ? { ...row, isLive: false } : row));
}

export function livePullRowState(index: number, isLive: boolean) {
  if (index >= PULL_WINDOW) return "leaving";
  return isLive ? "entering" : undefined;
}
