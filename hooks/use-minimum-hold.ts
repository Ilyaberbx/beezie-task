"use client";

import { useEffect, useState } from "react";

export function useMinimumHold(ready: boolean, floorMs: number) {
  const [floorPassed, setFloorPassed] = useState(false);

  useEffect(() => {
    if (!ready) return;
    const remaining = Math.max(0, floorMs - performance.now());
    const timer = window.setTimeout(() => setFloorPassed(true), remaining);
    return () => window.clearTimeout(timer);
  }, [ready, floorMs]);

  return ready && floorPassed;
}
