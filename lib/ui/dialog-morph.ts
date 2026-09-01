import { MORPH_EPSILON_PX, type Box } from "./box.ts";

export const MORPH_MS = 320;
export const MORPH_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

/** Mirrors the `*-out` animation durations in globals.css; keep the two in step. */
export const EXIT_MS = 260;

const VIEWPORT_SETTLE_MS = 300;
const VIEWPORT_EDGE_PX = 1;

export type Morph = {
  animation: Animation;
  overflow: string;
  contain: string;
  willChange: string;
  height: string;
  pinned: HTMLElement[];
};
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
  el.style.contain = active.contain;
  el.style.willChange = active.willChange;
  el.style.height = active.height;
  el.style.width = "";
  el.style.maxWidth = "";
  el.style.transform = "";
  for (const child of active.pinned) child.style.width = "";
}

function pinChildWidths(el: HTMLElement) {
  const inner = el.clientWidth;
  const children = Array.from(el.children).filter(
    (child): child is HTMLElement => child instanceof HTMLElement,
  );
  // Read every position before writing any width, so the loop cannot thrash layout.
  const inFlow = children.filter((child) => getComputedStyle(child).position !== "absolute");
  for (const child of inFlow) child.style.width = `${inner}px`;
  return inFlow;
}

/**
 * A sheet pinned to the bottom of the viewport only ever shows its top edge move:
 * the rest of the travel happens past the bottom of the screen. So hold the panel
 * at the taller of the two boxes and slide it — one layout write instead of a
 * relayout every frame, which is what made the resize stutter on a phone.
 */
function isBottomAnchored(el: HTMLElement, from: Box, to: Box) {
  if (Math.abs(to.w - from.w) > MORPH_EPSILON_PX) return false;
  return el.getBoundingClientRect().bottom >= window.innerHeight - VIEWPORT_EDGE_PX;
}

export function morphBox(el: HTMLElement, run: MorphRef, from: Box, to: Box) {
  stopMorph(el, run);
  const overflow = el.style.overflow;
  const contain = el.style.contain;
  const willChange = el.style.willChange;
  const height = el.style.height;
  el.style.overflow = "hidden";

  const slides = isBottomAnchored(el, from, to);
  const pinned = !slides && Math.abs(to.w - from.w) > MORPH_EPSILON_PX ? pinChildWidths(el) : [];

  let keyframes: Keyframe[];
  if (slides) {
    const tallest = Math.max(from.h, to.h);
    el.style.height = `${tallest}px`;
    el.style.willChange = "transform";
    keyframes = [
      { transform: `translateY(${tallest - from.h}px)` },
      { transform: `translateY(${tallest - to.h}px)` },
    ];
  } else {
    // The centred variant moves both edges, so its box genuinely has to travel.
    // Containment keeps that relayout inside the panel.
    el.style.contain = "layout paint";
    el.style.willChange = "width, height";
    keyframes = [
      { width: `${from.w}px`, maxWidth: `${from.w}px`, height: `${from.h}px` },
      { width: `${to.w}px`, maxWidth: `${to.w}px`, height: `${to.h}px` },
    ];
  }

  const animation = el.animate(keyframes, { duration: MORPH_MS, easing: MORPH_EASE });
  run.current = { animation, overflow, contain, willChange, height, pinned };
  const restore = () => {
    if (run.current?.animation === animation) stopMorph(el, run);
  };
  animation.finished.then(restore, restore);
  return animation;
}
