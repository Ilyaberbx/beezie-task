"use client";

import { useEffect } from "react";

const IDLE_TIMEOUT_MS = 2000;

export function useImagePreload(sources: string[]) {
  const key = sources.join("|");

  useEffect(() => {
    if (!key) return;

    let cancel = () => {};

    const warm = () => {
      for (const source of key.split("|")) {
        const image = new window.Image();
        image.decoding = "async";
        image.src = source;
      }
    };

    const schedule = () => {
      if (!window.requestIdleCallback) {
        const timer = window.setTimeout(warm, IDLE_TIMEOUT_MS);
        cancel = () => window.clearTimeout(timer);
        return;
      }
      const handle = window.requestIdleCallback(warm, { timeout: IDLE_TIMEOUT_MS });
      cancel = () => window.cancelIdleCallback(handle);
    };

    if (document.readyState === "complete") {
      schedule();
    } else {
      window.addEventListener("load", schedule, { once: true });
      cancel = () => window.removeEventListener("load", schedule);
    }

    return () => cancel();
  }, [key]);
}
