"use client";

import { asset } from "@/lib/asset";
import { useEffect, useState } from "react";
import { useMediaQuery, usePrefersReducedMotion } from "@/hooks/use-media-query";

const DESKTOP = "(min-width: 768px)";
const BUFFER_CEILING_MS = 6000;

export function useRevealPreload() {
  const isDesktop = useMediaQuery(DESKTOP, true);
  const prefersReducedMotion = usePrefersReducedMotion();
  const source = isDesktop ? asset("/media/reveal-web.mp4") : asset("/media/reveal-mobile.mp4");
  const [bufferedSource, setBufferedSource] = useState<string | null>(null);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const warmup = document.createElement("video");
    // Once the file is in the HTTP cache this element has done its job. Leaving
    // it live keeps a second decoder and a second range request open against the
    // same file the overlay is about to play — on a phone that is exactly the
    // contention that makes the reveal stall.
    const release = () => {
      warmup.removeAttribute("src");
      warmup.load();
    };
    const markBuffered = () => {
      setBufferedSource(source);
      release();
    };

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
      release();
    };
  }, [source, prefersReducedMotion]);

  return {
    source,
    isBuffered: bufferedSource === source,
    prefersReducedMotion,
  };
}
