"use client";

import Image from "next/image";
import { Check, Info, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { cn } from "@/lib/cn";
import { currency, splitDuration } from "@/lib/format";
import { useCountdown } from "@/hooks/claw/use-countdown";
import { Confetti } from "./confetti";
import { SwapAssay } from "./swap-assay";
import type { Pull } from "@/lib/claw/types";

type RevealMultiProps = {
  open: boolean;
  pulls: Pull[];
  selectedIds: string[];
  selectedValue: number;
  expiresAt: number;
  isSwapping: boolean;
  swappingIds: string[];
  onToggle: (pullId: string) => void;
  onToggleAll: () => void;
  onSwapSelected: () => void;
  onSwapOne: (pull: Pull) => void;
  onClose: () => void;
};

export function RevealMulti({
  open,
  pulls,
  selectedIds,
  selectedValue,
  expiresAt,
  isSwapping,
  swappingIds,
  onToggle,
  onToggleAll,
  onSwapSelected,
  onSwapOne,
  onClose,
}: RevealMultiProps) {
  const remainingMs = useCountdown(open ? expiresAt : null);
  const { minutes, seconds } = splitDuration(remainingMs ?? 0);
  const allSelected = selectedIds.length === pulls.length && pulls.length > 0;
  const expired = remainingMs !== null && remainingMs <= 0;
  const locked = isSwapping || expired;

  return (
    <Dialog open={open} onClose={onClose} label="Your pulls" variant="fullscreen">
      <div className="relative flex h-full flex-col">
        <Confetti />

        <div className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 pt-14 md:p-8 md:pt-14">
          <ul className="grid grid-cols-2 gap-2.5 md:grid-cols-4 md:gap-4">
            {pulls.map((pull) => (
              <PullCard
                key={pull.id}
                pull={pull}
                selected={selectedIds.includes(pull.id)}
                assaying={swappingIds.includes(pull.id)}
                receding={isSwapping && !swappingIds.includes(pull.id)}
                disabled={locked}
                onToggle={() => onToggle(pull.id)}
                onSwap={() => onSwapOne(pull)}
              />
            ))}
          </ul>
        </div>

        <div className="relative flex shrink-0 flex-col gap-3 border-t border-border bg-card px-4 py-3 pb-safe-12 md:flex-row md:items-center md:gap-6 md:px-8 md:py-4 md:pb-4">
          <div className="flex items-center justify-between gap-4 md:contents">
            <p className="text-xs font-medium text-secondary-foreground md:text-sm">
              {expired ? (
                <span className="text-foreground">Swap window closed</span>
              ) : (
                <>
                  Expires in:{" "}
                  <span className="tnum text-foreground">
                    {minutes} min {String(seconds).padStart(2, "0")} sec
                  </span>
                </>
              )}
            </p>
            <button
              type="button"
              onClick={onToggleAll}
              disabled={locked}
              className="text-sm font-medium text-secondary-foreground transition-colors hover:text-foreground disabled:opacity-50 md:order-2 md:ml-auto"
            >
              {allSelected ? "Clear" : "Select all"}
            </button>
          </div>

          <div className="flex items-center gap-4 md:order-3">
            <Button
              className="flex-1 md:w-[220px] md:flex-none"
              onClick={onSwapSelected}
              disabled={selectedIds.length === 0 || locked}
            >
              {expired
                ? "Swap window closed"
                : isSwapping
                  ? "Swap in progress"
                  : selectedIds.length === 0
                    ? "Swap"
                    : `Swap ${selectedIds.length} item${selectedIds.length > 1 ? "s" : ""} for ${currency(selectedValue)}`}
            </Button>
            <Info
              className="hidden size-4 shrink-0 text-secondary-foreground md:block"
              strokeWidth={2}
              aria-hidden
            />
          </div>
        </div>
      </div>
    </Dialog>
  );
}

function PullCard({
  pull,
  selected,
  assaying,
  receding,
  disabled,
  onToggle,
  onSwap,
}: {
  pull: Pull;
  selected: boolean;
  assaying: boolean;
  receding: boolean;
  disabled: boolean;
  onToggle: () => void;
  onSwap: () => void;
}) {
  const { collectible } = pull;

  return (
    <li
      className={cn(
        "flex flex-col gap-2 rounded-lg border bg-card p-2 transition-colors duration-200",
        selected ? "border-primary" : "border-border-strong hover:border-primary/40",
        assaying && "border-primary",
        receding && "animate-assay-recede",
      )}
    >
      <div
        className={cn(
          "relative aspect-square w-full overflow-hidden rounded-md transition-colors duration-500",
          assaying ? "bg-elevated" : "bg-white",
        )}
      >
        <Image
          src={collectible.image}
          alt={collectible.title}
          fill
          sizes="(min-width: 768px) 260px, 45vw"
          className={cn("object-cover", assaying && "animate-assay-card")}
        />
        {assaying && <SwapAssay value={collectible.swapValue} compact />}
        <button
          type="button"
          onClick={onToggle}
          disabled={disabled}
          aria-pressed={selected}
          aria-label={selected ? `Deselect ${collectible.title}` : `Select ${collectible.title}`}
          className={cn(
            "absolute right-2 top-2 grid size-6 place-items-center rounded-full transition-[background-color,transform,opacity] duration-200 active:scale-90",
            assaying && "opacity-0",
            selected
              ? "bg-primary text-primary-foreground"
              : "bg-background/85 text-foreground hover:bg-background",
          )}
        >
          {selected ? (
            <Check className="size-3.5" strokeWidth={3} />
          ) : (
            <Plus className="size-3.5" strokeWidth={2.5} />
          )}
        </button>
      </div>

      <p className="line-clamp-2 min-h-[2lh] px-1 text-xs font-medium leading-snug text-white">
        {collectible.title}
      </p>

      <Button
        className="h-9 w-full text-xs"
        onClick={onSwap}
        disabled={disabled || selected}
      >
        Swap for {currency(collectible.swapValue)}
      </Button>
    </li>
  );
}
