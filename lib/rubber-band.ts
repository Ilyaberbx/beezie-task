/** How far past an end the content may travel, in pixels. */
export const MAX_PULL = 80;
/** Fraction of a scroll delta that becomes pull at the resting edge. */
const RESISTANCE = 0.5;

/**
 * One step of a rubber-band overscroll. Positive offset means the content has
 * been dragged down past the top; negative means up past the bottom. Each pixel
 * buys less than the last, so the pull eases into its cap rather than hitting it.
 * A delta that carries the content back through neutral returns 0 — that is the
 * point where the real scroller should take the gesture back.
 */
export function nextOverscroll(offset: number, delta: number, max = MAX_PULL) {
  const pulled = offset - delta * RESISTANCE * (1 - Math.abs(offset) / max);
  if (offset !== 0 && Math.sign(pulled) !== Math.sign(offset)) return 0;
  return Math.max(-max, Math.min(max, pulled));
}
