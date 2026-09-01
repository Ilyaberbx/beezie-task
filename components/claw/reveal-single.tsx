import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { cn } from "@/lib/cn";
import { currency } from "@/lib/format";
import { SwapAssay } from "./swap-assay";
import type { Pull } from "@/lib/claw/types";

const artworkSharesTheTextColumnGutters =
  "relative aspect-square w-full justify-self-center overflow-hidden rounded-xl shadow-card transition-colors duration-500 sm:max-w-[min(70%,52svh)] md:landscape:max-w-[648px] md:landscape:justify-self-end";

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
  const artworkDissolvesIntoDark = isSwapping;

  return (
    <Dialog open={open} onClose={onKeep} label="Your pull" variant="fullscreen">
      <div className="relative flex h-full flex-col scroll-y overscroll-contain">
        <div className="relative grid flex-1 content-center-safe gap-6 p-4 pt-12 sm:gap-8 sm:p-8 sm:pt-16 md:landscape:grid-cols-2 md:landscape:content-center md:landscape:items-start md:landscape:gap-12 md:landscape:p-12">
          <div
            className={cn(
              artworkSharesTheTextColumnGutters,
              artworkDissolvesIntoDark ? "bg-elevated" : "bg-white",
            )}
          >
            <Image
              src={collectible.image}
              alt={collectible.title}
              fill
              priority
              sizes="(min-width: 744px) 648px, 100vw"
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
              "flex flex-col gap-6 sm:mx-auto sm:w-full sm:max-w-[560px] md:landscape:mx-0 md:landscape:max-w-[584px]",
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
