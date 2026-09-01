import { createBooleanStore, createCounterStore, type ExternalStore } from "./store.ts";
import type { Box } from "./box.ts";

export type DialogPhase = "open" | "closing";

const HANDOFF_MS = 500;

const openDialogs = new Map<symbol, DialogPhase>();
const version = createCounterStore();

let waiting = 0;
let handoff: (Box & { at: number }) | null = null;

export const dialogVersion: ExternalStore<number> = version;
export const anyDialogOpen = createBooleanStore();

export const waitingDialogs: ExternalStore<number> = {
  subscribe: version.subscribe,
  get: () => waiting,
  getServer: () => 0,
};

export function publish(id: symbol, phase: DialogPhase | null) {
  if (phase === null) {
    if (!openDialogs.delete(id)) return;
  } else {
    if (openDialogs.get(id) === phase) return;
    openDialogs.set(id, phase);
  }
  version.increment();
  anyDialogOpen.set(openDialogs.size > 0);
}

export function setWaiting(delta: number) {
  waiting += delta;
  version.increment();
}

export function hasOtherDialog(id: symbol) {
  for (const key of openDialogs.keys()) if (key !== id) return true;
  return false;
}

export function leaveHandoffBox(box: Box) {
  handoff = { ...box, at: performance.now() };
}

export function takeFreshHandoffBox(): Box | null {
  const left = handoff;
  handoff = null;
  if (!left || performance.now() - left.at >= HANDOFF_MS) return null;
  return { w: left.w, h: left.h };
}
