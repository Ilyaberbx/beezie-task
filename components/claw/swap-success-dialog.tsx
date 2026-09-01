"use client";

import { useEffect, useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { usePrefersReducedMotion } from "@/hooks/use-media-query";
import { currency } from "@/lib/format";
import type { SwapResult } from "@/lib/claw/types";

/** Long enough to read as money landing, short enough not to hold the sheet. */
const COUNT_MS = 900;

export function SwapSuccessDialog({
  open,
  result,
  count,
  onClose,
}: {
  open: boolean;
  result: SwapResult;
  count: number;
  onClose: () => void;
}) {
  const credited = useCountUp(result.credited, open);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      label="Swap success"
      variant="sheet"
      panelClassName="sm:max-w-[420px]"
    >
      <div className="flex flex-col items-center gap-3 p-8 pb-safe-32 text-center">
        <span className="relative grid size-14 animate-dialog-in place-items-center rounded-full bg-emerald text-background">
          {open && (
            <>
              <span
                aria-hidden
                className="absolute inset-0 animate-live-ping rounded-full bg-emerald"
              />
              <TickIcon />
            </>
          )}
        </span>

        <h2 className="text-lg font-semibold text-white">
          {count > 1 ? `${count} items swapped` : "Swap success"}
        </h2>

        <p className="tnum animate-credit-in text-4xl font-bold leading-none text-primary">
          {currency(credited)}
        </p>

        <p className="text-sm text-secondary-foreground">credited to your wallet</p>

        <span className="tnum animate-rise-in rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary [animation-delay:620ms]">
          +{result.points} points
        </span>
      </div>
    </Dialog>
  );
}

/** Runs the credited figure up from zero so the number itself reads as the payoff. */
function useCountUp(target: number, active: boolean) {
  const reduceMotion = usePrefersReducedMotion();
  const [value, setValue] = useState(target);

  useEffect(() => {
    if (!active || reduceMotion) {
      setValue(target);
      return;
    }
    const start = performance.now();
    let frame = requestAnimationFrame(function step(now: number) {
      const progress = Math.min(1, (now - start) / COUNT_MS);
      // Ease out cubic, so the last dollars settle rather than slam.
      setValue(Math.round(target * (1 - (1 - progress) ** 3)));
      if (progress < 1) frame = requestAnimationFrame(step);
    });
    return () => cancelAnimationFrame(frame);
  }, [target, active, reduceMotion]);

  return value;
}

/** Lucide's Check, split at the elbow so each leg can draw in turn. */
function TickIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="relative size-8"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <g
        className="animate-tick-settle"
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
      >
        <path d="M4 12 9 17" strokeDasharray="8" className="animate-tick-a" />
        <path d="M9 17 20 6" strokeDasharray="16" className="animate-tick-b" />
      </g>
    </svg>
  );
}
