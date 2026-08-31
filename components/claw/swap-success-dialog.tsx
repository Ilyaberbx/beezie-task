"use client";

import { Check } from "lucide-react";
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
      <div className="flex flex-col items-center gap-3 p-8 pb-[max(32px,env(safe-area-inset-bottom))] text-center">
        <span className="grid size-14 animate-dialog-in place-items-center rounded-full bg-emerald text-background">
          <Check className="size-8" strokeWidth={3} />
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
