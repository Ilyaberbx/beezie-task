import { cn } from "@/lib/cn";
import { currency } from "@/lib/format";
import { assayMarkDelayMs } from "@/lib/ui/stagger";

const CORNER_MARKS_OUTSIDE_IN = [
  "left-0 top-0 border-l-2 border-t-2 rounded-tl-[3px]",
  "right-0 top-0 border-r-2 border-t-2 rounded-tr-[3px]",
  "left-0 bottom-0 border-b-2 border-l-2 rounded-bl-[3px]",
  "right-0 bottom-0 border-b-2 border-r-2 rounded-br-[3px]",
];

export function SwapAssay({
  value,
  settling,
  delayMs = 0,
  compact,
}: {
  value: number;
  settling: boolean;
  delayMs?: number;
  compact?: boolean;
}) {
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <span
        className={cn(
          "absolute inset-0 bg-assay-lines",
          settling ? "animate-fade-out" : "animate-fade-in",
        )}
      />

      <span className={cn("absolute", compact ? "inset-1.5" : "inset-3")}>
        {CORNER_MARKS_OUTSIDE_IN.map((mark, index) => (
          <span
            key={mark}
            style={{ animationDelay: settling ? undefined : `${assayMarkDelayMs(index)}ms` }}
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
          data-assay-scan
          style={{ animationDelay: `${delayMs}ms` }}
          className="absolute inset-x-0 top-0 h-[26%] animate-assay-scan bg-assay-scan"
        />
      )}
    </span>
  );
}
