"use client";

import { useSyncExternalStore } from "react";

let sharedNow = 0;

function subscribeToSeconds(onStoreChange: () => void) {
  sharedNow = Date.now();
  onStoreChange();
  const timer = window.setInterval(() => {
    sharedNow = Date.now();
    onStoreChange();
  }, 1000);
  return () => window.clearInterval(timer);
}

export function useCountdown(expiresAt: number | null) {
  const now = useSyncExternalStore(
    subscribeToSeconds,
    () => sharedNow,
    () => 0,
  );

  if (expiresAt === null || now === 0) return 0;
  return Math.max(0, expiresAt - now);
}
