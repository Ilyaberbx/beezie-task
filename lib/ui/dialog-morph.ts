import { MORPH_EPSILON_PX, type Box } from "./box.ts";

export const MORPH_MS = 320;
export const MORPH_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

const VIEWPORT_SETTLE_MS = 300;

export type Morph = { animation: Animation; overflow: string; pinned: HTMLElement[] };
export type MorphRef = { current: Morph | null };

let viewportResizedAt = 0;
if (typeof window !== "undefined") {
  window.addEventListener(
    "resize",
    () => {
      viewportResizedAt = performance.now();
    },
    { passive: true },
  );
}

export function viewportIsStillSettling() {
  return performance.now() - viewportResizedAt < VIEWPORT_SETTLE_MS;
}

export function stopMorph(el: HTMLElement, run: MorphRef) {
  const active = run.current;
  if (!active) return;
  run.current = null;
  active.animation.cancel();
  el.style.overflow = active.overflow;
  el.style.width = "";
  el.style.maxWidth = "";
  el.style.height = "";
  for (const child of active.pinned) child.style.width = "";
}

function pinChildWidths(el: HTMLElement) {
  const inner = el.clientWidth;
  const pinned: HTMLElement[] = [];
  for (const child of Array.from(el.children)) {
    if (!(child instanceof HTMLElement)) continue;
    if (getComputedStyle(child).position === "absolute") continue;
    child.style.width = `${inner}px`;
    pinned.push(child);
  }
  return pinned;
}

export function morphBox(el: HTMLElement, run: MorphRef, from: Box, to: Box) {
  stopMorph(el, run);
  const overflow = el.style.overflow;
  el.style.overflow = "hidden";

  const widthTravels = Math.abs(to.w - from.w) > MORPH_EPSILON_PX;
  const pinned = widthTravels ? pinChildWidths(el) : [];

  const animation = el.animate(
    [
      { width: `${from.w}px`, maxWidth: `${from.w}px`, height: `${from.h}px` },
      { width: `${to.w}px`, maxWidth: `${to.w}px`, height: `${to.h}px` },
    ],
    { duration: MORPH_MS, easing: MORPH_EASE },
  );
  run.current = { animation, overflow, pinned };
  const restore = () => {
    if (run.current?.animation === animation) stopMorph(el, run);
  };
  animation.finished.then(restore, restore);
  return animation;
}
