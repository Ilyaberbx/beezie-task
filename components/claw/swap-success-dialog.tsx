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
        {open && <SuccessMark />}
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

function SuccessMark() {
  return (
    <span aria-hidden className="relative grid size-14 place-items-center">
      <span className="absolute inset-0 animate-check-halo rounded-full border border-emerald" />
      <svg viewBox="0 0 56 56" className="size-14 overflow-visible">
        <circle
          cx="28"
          cy="28"
          r="26"
          fill="none"
          stroke="var(--color-emerald)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="164"
          className="animate-check-ring"
          style={{ transformOrigin: "center", transform: "rotate(-90deg)" }}
        />
        <circle
          cx="28"
          cy="28"
          r="26"
          fill="var(--color-emerald)"
          className="animate-check-disc"
          style={{ transformOrigin: "center" }}
        />
        <path
          d="M17 29 24 36 39 21"
          fill="none"
          stroke="var(--color-background)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="32"
          className="animate-check-draw"
        />
      </svg>
    </span>
  );
}
