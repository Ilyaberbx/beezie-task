"use client";

import { asset } from "@/lib/asset";
import { useEffect, useState } from "react";
import { useMediaQuery, usePrefersReducedMotion } from "@/hooks/use-media-query";

const DESKTOP = "(min-width: 768px)";
const BUFFER_CEILING_MS = 6000;
/** The same click opens the review sheet; let its transition have the frame first. */
const WARMUP_IDLE_TIMEOUT_MS = 600;

export function useRevealPreload(enabled: boolean) {
  const isDesktop = useMediaQuery(DESKTOP, true);
  const prefersReducedMotion = usePrefersReducedMotion();
  const source = isDesktop ? asset("/media/reveal-web.mp4") : asset("/media/reveal-mobile.mp4");
  const [bufferedSource, setBufferedSource] = useState<string | null>(null);

  useEffect(() => {
    if (prefersReducedMotion || !enabled) return;

    const warmup = document.createElement("video");
    const releaseSecondDecoderAndRangeRequest = () => {
      warmup.removeAttribute("src");
      warmup.load();
    };
    const markBuffered = () => {
      setBufferedSource(source);
      releaseSecondDecoderAndRangeRequest();
    };

    warmup.preload = "auto";
    warmup.muted = true;
    warmup.playsInline = true;
    warmup.addEventListener("canplaythrough", markBuffered, { once: true });

    // Fetching and decoding the reveal while the sheet is still animating starves
    // the transition on a phone. The ceiling below still guarantees a handover.
    const ceiling = window.setTimeout(markBuffered, BUFFER_CEILING_MS);
    const begin = () => {
      warmup.src = source;
      warmup.load();
    };
    let cancelWarmup: () => void;
    if (window.requestIdleCallback) {
      const handle = window.requestIdleCallback(begin, { timeout: WARMUP_IDLE_TIMEOUT_MS });
      cancelWarmup = () => window.cancelIdleCallback(handle);
    } else {
      const timer = window.setTimeout(begin, WARMUP_IDLE_TIMEOUT_MS);
      cancelWarmup = () => window.clearTimeout(timer);
    }

    return () => {
      cancelWarmup();
      window.clearTimeout(ceiling);
      warmup.removeEventListener("canplaythrough", markBuffered);
      releaseSecondDecoderAndRangeRequest();
    };
  }, [source, prefersReducedMotion, enabled]);

  return {
    source,
    isBuffered: bufferedSource === source,
    prefersReducedMotion,
  };
}
