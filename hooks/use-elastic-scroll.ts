"use client";

import { useEffect, useRef } from "react";
import { nextOverscroll } from "@/lib/rubber-band";

/** How long after the last wheel event the pull springs back. */
const RELEASE_MS = 90;

/**
 * Rubber-band overscroll for a wheel/trackpad scroller: past either end the
 * content keeps giving, then springs back once the gesture stops.
 * ponytail: wheel only — touch already bounces natively. Add a touch branch if
 * an Android build needs the same feel.
 */
export function useElasticScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const scroller = ref.current;
    const content = scroller?.firstElementChild;
    if (!scroller || !(content instanceof HTMLElement)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let offset = 0;
    let release = 0;

    const atEdge = (delta: number) =>
      (delta < 0 && scroller.scrollTop <= 0) ||
      (delta > 0 &&
        Math.ceil(scroller.scrollTop + scroller.clientHeight) >= scroller.scrollHeight);

    const settle = () => {
      offset = 0;
      content.style.transition = "translate 420ms var(--ease-out-quint)";
      content.style.translate = "0";
    };

    const onWheel = (event: WheelEvent) => {
      if (offset === 0 && !atEdge(event.deltaY)) return;
      event.preventDefault();
      offset = nextOverscroll(offset, event.deltaY);
      content.style.transition = "";
      content.style.translate = `0 ${offset}px`;
      clearTimeout(release);
      release = window.setTimeout(settle, RELEASE_MS);
    };

    scroller.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      scroller.removeEventListener("wheel", onWheel);
      clearTimeout(release);
      content.style.transition = "";
      content.style.translate = "";
    };
  }, []);

  return ref;
}
