"use client";

import { useEffect, useLayoutEffect } from "react";

type Restored = Pick<CSSStyleDeclaration, "overflow" | "position" | "top" | "left" | "right">;

let locks = 0;
let restore: Restored | null = null;
let offset = 0;

/**
 * iOS Safari ignores `overflow: hidden` on the scrolling element for touch
 * gestures, so the page kept scrolling behind an open dialog. Pinning the body
 * at its current offset is the only thing that holds there; the offset is
 * handed back on unlock so the page does not jump to the top.
 *
 * It runs before paint, and ahead of the dialog's own choreography, because
 * `showModal()` focuses the panel and that focus scrolls the page to the top —
 * read the offset after it and you capture a zero.
 */
const useBeforePaint = typeof window === "undefined" ? useEffect : useLayoutEffect;

export function useScrollLock(locked: boolean) {
  useBeforePaint(() => {
    if (!locked) return;

    if (locks++ === 0) {
      const { style } = document.body;
      offset = window.scrollY;
      restore = {
        overflow: style.overflow,
        position: style.position,
        top: style.top,
        left: style.left,
        right: style.right,
      };
      style.overflow = "hidden";
      style.position = "fixed";
      style.top = `-${offset}px`;
      style.left = "0";
      style.right = "0";
    }

    return () => {
      if (--locks > 0 || !restore) return;
      Object.assign(document.body.style, restore);
      restore = null;
      window.scrollTo(0, offset);
    };
  }, [locked]);
}
