import { createBooleanStore, createCounterStore, type ExternalStore } from "./store.ts";
import type { Box } from "./box.ts";

export type DialogPhase = "open" | "closing";
export type Handoff = Box & { at: number; taken: boolean };

const HANDOFF_MS = 500;

const openDialogs = new Map<symbol, DialogPhase>();
const version = createCounterStore();

let handoff: Handoff | null = null;

export const dialogVersion: ExternalStore<number> = version;
export const anyDialogOpen = createBooleanStore();

export function publish(id: symbol, phase: DialogPhase | null) {
  if (phase === null) {
    if (!openDialogs.delete(id)) return;
  } else {
    if (openDialogs.get(id) === phase) return;
    openDialogs.set(id, phase);
  }
  version.increment();
  anyDialogOpen.set(hasLiveDialog(null));
}

export function hasLiveDialog(id: symbol | null) {
  for (const [key, phase] of openDialogs) if (key !== id && phase === "open") return true;
  return false;
}

export function leaveHandoffBox(box: Box): Handoff {
  handoff = { ...box, at: performance.now(), taken: false };
  return handoff;
}

export function takeFreshHandoffBox(): Handoff | null {
  const left = handoff;
  handoff = null;
  if (!left || performance.now() - left.at >= HANDOFF_MS) return null;
  return left;
}
