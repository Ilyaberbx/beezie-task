"use client";

import { useEffect, useState } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";

const DESKTOP = "(min-width: 768px)";
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
const BUFFER_CEILING_MS = 6000;

export function useRevealPreload() {
  const isDesktop = useMediaQuery(DESKTOP, true);
  const prefersReducedMotion = useMediaQuery(REDUCED_MOTION, false);
  const source = isDesktop ? "/media/reveal-web.mp4" : "/media/reveal-mobile.mp4";
  const [bufferedSource, setBufferedSource] = useState<string | null>(null);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const warmup = document.createElement("video");
    const markBuffered = () => setBufferedSource(source);

    warmup.preload = "auto";
    warmup.muted = true;
    warmup.playsInline = true;
    warmup.addEventListener("canplaythrough", markBuffered, { once: true });
    warmup.src = source;
    warmup.load();

    const ceiling = window.setTimeout(markBuffered, BUFFER_CEILING_MS);

    return () => {
      window.clearTimeout(ceiling);
      warmup.removeEventListener("canplaythrough", markBuffered);
      warmup.removeAttribute("src");
      warmup.load();
    };
  }, [source, prefersReducedMotion]);

  return {
    source,
    isBuffered: bufferedSource === source,
    prefersReducedMotion,
  };
}
