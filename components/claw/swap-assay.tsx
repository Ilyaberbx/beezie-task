"use client";

import { cn } from "@/lib/cn";
import { currency } from "@/lib/format";

/** Corner brackets, drawn from the outside in. */
const MARKS = [
  "left-0 top-0 border-l-2 border-t-2 rounded-tl-[3px]",
  "right-0 top-0 border-r-2 border-t-2 rounded-tr-[3px]",
  "left-0 bottom-0 border-b-2 border-l-2 rounded-bl-[3px]",
  "right-0 bottom-0 border-b-2 border-r-2 rounded-br-[3px]",
];

/**
 * The swap signature: the artwork is scanned by a gold pass, drained to grey,
 * and its value lifted out as credit.
 *
 * Settlement has no fixed length, so the two halves are separated. The pass
 * repeats for as long as the swap is in flight; the flare and the credit only
 * run once it lands, on `settling`.
 */
export function SwapAssay({
  value,
  settling,
  delayMs = 0,
  compact,
}: {
  value: number;
  settling: boolean;
  /** Offsets the repeating pass so a grid sweeps rather than flashes in unison. */
  delayMs?: number;
  compact?: boolean;
}) {
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* The scanner's own texture, laid over the drained artwork. */}
      <span
        className={cn(
          "absolute inset-0 bg-assay-lines",
          settling ? "animate-fade-out" : "animate-fade-in",
        )}
      />

      <span className={cn("absolute", compact ? "inset-1.5" : "inset-3")}>
        {MARKS.map((mark, index) => (
          <span
            key={mark}
            style={{ animationDelay: settling ? undefined : `${index * 70}ms` }}
            className={cn(
              "absolute border-primary",
              compact ? "size-2.5" : "size-5",
              mark,
              settling ? "animate-assay-mark-out" : "animate-assay-mark",
            )}
          />
        ))}
      </span>

      {settling ? (
        <>
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
        </>
      ) : (
        <span
          style={{ animationDelay: `${delayMs}ms` }}
          className="absolute inset-x-0 top-0 h-[26%] animate-assay-scan bg-assay-scan blur-[0.5px]"
        />
      )}
    </span>
  );
}
