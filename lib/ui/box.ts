export type Box = { w: number; h: number };

export const MORPH_EPSILON_PX = 1;

export function measureBox(el: HTMLElement): Box {
  return { w: el.offsetWidth, h: el.offsetHeight };
}

export function boxesDiffer(a: Box, b: Box, tolerance: number): boolean {
  return Math.abs(a.w - b.w) > tolerance || Math.abs(a.h - b.h) > tolerance;
}
