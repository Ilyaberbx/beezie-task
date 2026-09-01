"use client";

import Image from "next/image";
import { Check, Info, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { thumb } from "@/lib/asset";
import { cn } from "@/lib/cn";
import { currency, splitDuration } from "@/lib/format";
import { isSwapWindowExpired, swapButtonLabel } from "@/lib/claw/session";
import { useCountdown, useDeadlinePassed } from "@/hooks/claw/use-countdown";
import { assaySweepDelayMs } from "@/lib/ui/stagger";
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
  isSettling: boolean;
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
  isSettling,
  onToggle,
  onToggleAll,
  onSwapSelected,
  onSwapOne,
  onClose,
}: RevealMultiProps) {
  const allSelected = selectedIds.length === pulls.length && pulls.length > 0;
  const expired = useDeadlinePassed(open ? expiresAt : null);
  const locked = isSwapping || expired;

  return (
    <Dialog open={open} onClose={onClose} label="Your pulls" variant="fullscreen">
      <div className="relative flex h-full flex-col">
        <div className="relative min-h-0 flex-1 scroll-y overscroll-contain px-4 pb-4 pt-[calc(3.5rem+env(safe-area-inset-top))] md:p-8 md:pt-[66px]">
          <ul className="grid grid-cols-2 gap-x-2 gap-y-2.5 md:grid-cols-4 md:gap-4">
            {pulls.map((pull, index) => (
              <PullCard
                key={pull.id}
                pull={pull}
                index={index}
                selected={selectedIds.includes(pull.id)}
                assaying={swappingIds.includes(pull.id)}
                settling={isSettling}
                receding={isSwapping && !swappingIds.includes(pull.id)}
                disabled={locked}
                onToggle={() => onToggle(pull.id)}
                onSwap={() => onSwapOne(pull)}
              />
            ))}
          </ul>
        </div>

        <div className="relative flex shrink-0 flex-col gap-4 border-t border-border bg-card px-4 pt-4 pb-safe-16 md:h-21 md:flex-row md:items-center md:gap-6 md:px-8 md:pt-0 md:pb-0">
          <div className="flex items-center justify-between gap-4 md:contents">
            <SwapWindow expiresAt={open ? expiresAt : null} />
            <button
              type="button"
              onClick={onToggleAll}
              disabled={locked}
              className="text-sm font-medium text-secondary-foreground transition-colors hover:text-foreground disabled:opacity-50 md:order-2 md:ml-auto"
            >
              {allSelected ? "Clear" : "Select all"}
            </button>
          </div>

          <div className="flex items-center gap-2 md:order-3">
            <Button
              className="[&]:h-11 flex-1 md:w-[288px] md:flex-none"
              onClick={onSwapSelected}
              disabled={selectedIds.length === 0 || locked}
            >
              {swapButtonLabel({
                expired,
                isSwapping,
                selectedCount: selectedIds.length,
                selectedValue,
              })}
            </Button>
            <Info
              className="hidden size-6 shrink-0 text-secondary-foreground md:block"
              strokeWidth={2}
              aria-hidden
            />
          </div>
        </div>
      </div>
    </Dialog>
  );
}

function SwapWindow({ expiresAt }: { expiresAt: number | null }) {
  const remainingMs = useCountdown(expiresAt);
  const { minutes, seconds } = splitDuration(remainingMs ?? 0);

  return (
    <p className="text-xs font-medium text-secondary-foreground">
      {isSwapWindowExpired(remainingMs) ? (
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
  );
}

function PullCard({
  pull,
  index,
  selected,
  assaying,
  settling,
  receding,
  disabled,
  onToggle,
  onSwap,
}: {
  pull: Pull;
  index: number;
  selected: boolean;
  assaying: boolean;
  settling: boolean;
  receding: boolean;
  disabled: boolean;
  onToggle: () => void;
  onSwap: () => void;
}) {
  const { collectible } = pull;

  return (
    <li
      className={cn(
        "flex flex-col rounded-lg border bg-card p-1 transition-colors duration-200",
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
          src={thumb(collectible.image)}
          alt={collectible.title}
          fill
          sizes="(min-width: 768px) 260px, 45vw"
          className={cn(
            "object-cover",
            assaying && (settling ? "animate-assay-finale" : "animate-assay-drain"),
          )}
        />
        {assaying && (
          <SwapAssay
            value={collectible.swapValue}
            settling={settling}
            delayMs={assaySweepDelayMs(index)}
            compact
          />
        )}
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

      <div className="flex flex-col px-0.5 pb-1.5 pt-2.5 md:px-2 md:pb-2.5 md:pt-3.5">
        <p className="line-clamp-2 min-h-[2lh] text-xs font-medium leading-4 text-white md:text-sm md:leading-5">
          {collectible.title}
        </p>

        <Button
          className="mt-2.5 w-full text-xs [&]:h-9 md:mt-6 md:text-sm md:[&]:h-10"
          onClick={onSwap}
          disabled={disabled || selected}
        >
          Swap for {currency(collectible.swapValue)}
        </Button>
      </div>
    </li>
  );
}
