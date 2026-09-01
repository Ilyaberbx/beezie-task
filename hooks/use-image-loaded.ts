"use client";

import { useState } from "react";

export function useImageLoaded() {
  const [loaded, setLoaded] = useState(false);
  const markLoaded = () => setLoaded(true);
  const catchHitsDecodedBeforeHydration = (node: HTMLImageElement | null) => {
    if (node?.complete) markLoaded();
  };

  return { loaded, ref: catchHitsDecodedBeforeHydration, onLoad: markLoaded };
}
