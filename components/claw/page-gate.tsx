"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { asset } from "@/lib/asset";
import { cn } from "@/lib/cn";
import { useStageReady } from "@/hooks/claw/use-stage-ready";
import { usePrefersReducedMotion } from "@/hooks/use-media-query";

/** Hold the gate this long even on a warm cache, so it reads as a curtain, not a flicker. */
const FLOOR_MS = 640;

export function PageGate() {
  const stageReady = useStageReady();
  const prefersReducedMotion = usePrefersReducedMotion();
  const [floorPassed, setFloorPassed] = useState(false);
  const done = prefersReducedMotion || (stageReady && floorPassed);

  useEffect(() => {
    if (!stageReady) return;
    const remaining = Math.max(0, FLOOR_MS - performance.now());
    const timer = window.setTimeout(() => setFloorPassed(true), remaining);
    return () => window.clearTimeout(timer);
  }, [stageReady]);

  return (
    <div
      aria-hidden
      data-done={done || undefined}
      // No animate-* on the wrapper: the CSS ceiling must lift it even if JS never runs.
      className={cn(
        "fixed inset-0 z-50 grid place-items-center bg-background",
        done ? "animate-gate-out-now" : "animate-gate-out",
      )}
    >
      <div className="flex flex-col items-center gap-7">
        <Image
          src={asset("/media/beezie-mark.svg")}
          alt=""
          width={22}
          height={32}
          priority
          className="h-12 w-auto"
        />
        <div className="h-px w-32 overflow-hidden rounded-full bg-border-strong">
          <div
            className={cn(
              "h-full w-full origin-left bg-primary",
              done
                ? "scale-x-100 transition-transform duration-200 ease-out"
                : "animate-gate-progress",
            )}
          />
        </div>
      </div>
    </div>
  );
}
