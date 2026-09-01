"use client";

import { useEffect, useState } from "react";

export function useRotatingIndex(length: number, intervalMs: number, active: boolean) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!active || length === 0) return;
    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % length),
      intervalMs,
    );
    return () => window.clearInterval(timer);
  }, [active, length, intervalMs]);

  return index;
}
