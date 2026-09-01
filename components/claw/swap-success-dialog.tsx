"use client";

import { Dialog } from "@/components/ui/dialog";
import { currency } from "@/lib/format";
import type { SwapResult } from "@/lib/claw/types";

export function SwapSuccessDialog({
  open,
  result,
  onClose,
}: {
  open: boolean;
  result: SwapResult;
  onClose: () => void;
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      label="Swap success"
      variant="sheet"
      panelClassName="sm:max-w-[420px]"
    >
      <div className="flex flex-col items-center gap-3 p-8 pb-safe-32 text-center">
        <span className="grid size-14 animate-dialog-in place-items-center rounded-full bg-emerald text-background">
          {open && <TickIcon />}
        </span>
        <h2 className="text-lg font-semibold text-white">Swap success</h2>
        <p className="text-sm text-secondary-foreground">
          {currency(result.credited)} has been credited to your wallet.
        </p>
        <span className="tnum rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
          +{result.points} points
        </span>
      </div>
    </Dialog>
  );
}

/** Lucide's Check, split at the elbow so each leg can draw in turn. */
function TickIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-8"
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
