"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { cn } from "@/lib/cn";
import { currency } from "@/lib/format";
import { Confetti } from "./confetti";
import { SwapAssay } from "./swap-assay";
import type { Pull } from "@/lib/claw/types";

type RevealSingleProps = {
  open: boolean;
  pull: Pull;
  isSwapping: boolean;
  isSettling: boolean;
  onSwap: () => void;
  onKeep: () => void;
};

export function RevealSingle({
  open,
  pull,
  isSwapping,
  isSettling,
  onSwap,
  onKeep,
}: RevealSingleProps) {
  const { collectible } = pull;

  return (
    <Dialog open={open} onClose={onKeep} label="Your pull" variant="fullscreen">
      <div className="relative flex h-full flex-col overflow-y-auto">
        <Confetti />

        <div className="relative grid flex-1 content-center-safe gap-6 p-4 pt-12 md:grid-cols-2 md:content-center md:items-center md:gap-12 md:p-12">
          <div
            className={cn(
              // Sized off width alone, the square eats the whole panel on any
              // window that is wide but not wide enough for two columns, and
              // the swap buttons fall off the bottom. Cap it by height too.
              "relative aspect-square w-full max-w-[min(80%,34svh)] justify-self-center overflow-hidden rounded-xl shadow-card transition-colors duration-500 md:max-w-[min(440px,60svh)] md:justify-self-end",
              // The artwork drains away; it has to dissolve into the dark, not into the frame's white.
              isSwapping ? "bg-elevated" : "bg-white",
            )}
          >
            <Image
              src={collectible.image}
              alt={collectible.title}
              fill
              priority
              sizes="(min-width: 768px) 500px, 90vw"
              className={cn(
                "object-cover",
                isSettling && "animate-assay-finale",
                isSwapping && !isSettling && "animate-assay-drain",
                !isSwapping && "animate-fade-in",
              )}
            />
            {isSwapping && (
              <SwapAssay value={collectible.swapValue} settling={isSettling} />
            )}
          </div>

          <div
            className={cn(
              "flex flex-col gap-6 md:max-w-[446px]",
              isSwapping && "animate-assay-recede",
            )}
          >
            <h2 className="text-xl font-semibold leading-snug text-white md:text-3xl">
              {collectible.title}
            </h2>

            <div className="flex flex-col gap-1.5">
              <p className="text-sm font-medium text-secondary-foreground">Swap Value</p>
              <p className="tnum text-4xl font-bold leading-none text-primary md:text-5xl">
                {currency(collectible.swapValue)}
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Button onClick={onSwap} disabled={isSwapping}>
                {isSwapping ? "Swap in progress" : "Swap Now"}
              </Button>
              <Button variant="secondary" onClick={onKeep} disabled={isSwapping}>
                Keep Item
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
