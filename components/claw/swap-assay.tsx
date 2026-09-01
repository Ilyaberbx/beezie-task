"use client";

import { cn } from "@/lib/cn";
import { currency } from "@/lib/format";

/**
 * The swap signature: the artwork is scanned by a gold pass, drained to grey,
 * and its value lifted out as credit. Sits inside the card's clipped frame and
 * runs exactly as long as the settlement, so it ends on the success sheet.
 */
export function SwapAssay({ value, compact }: { value: number; compact?: boolean }) {
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <span className="absolute inset-x-0 top-0 h-[26%] animate-assay-scan bg-assay-scan blur-[0.5px]" />
      <span className="absolute inset-0 animate-assay-bloom bg-assay-bloom" />
      <span
        className={cn(
          "tnum absolute inset-x-0 top-1/2 animate-assay-credit text-center font-bold text-primary",
          compact ? "text-sm" : "text-3xl",
        )}
        style={{ textShadow: "0 2px 12px #131313" }}
      >
        +{currency(value)}
      </span>
    </span>
  );
}
