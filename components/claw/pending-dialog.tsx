"use client";

import Image from "next/image";
import { cn } from "@/lib/cn";
import { currency } from "@/lib/format";
import { Dialog } from "@/components/ui/dialog";
import { useRotatingIndex } from "@/hooks/use-rotating-index";
import type { Collectible } from "@/lib/claw/types";

const ROTATION_MS = 1100;

export function PendingDialog({
  open,
  previews,
}: {
  open: boolean;
  previews: Collectible[];
}) {
  const index = useRotatingIndex(previews.length, ROTATION_MS, open);

  const preview = previews[index];
  if (!preview) return null;

  return (
    <Dialog
      open={open}
      onClose={() => undefined}
      label="Preparing your pull"
      variant="sheet"
      dismissible={false}
      panelClassName="sm:max-w-[420px]"
    >
      <div className="flex flex-col items-center gap-4 p-6 pb-safe-24">
        <h2 className="text-base font-semibold text-white">What you can pull</h2>

        <div className="relative aspect-square w-full max-w-[220px] overflow-hidden rounded-md bg-white">
          <Image
            key={preview.id}
            src={preview.image}
            alt={preview.title}
            fill
            sizes="220px"
            className="animate-fade-in object-cover"
          />
        </div>

        <div className="flex gap-1.5" aria-hidden>
          {previews.map((candidate, dotIndex) => (
            <span
              key={candidate.id}
              className={cn(
                "h-1 rounded-full transition-all duration-300",
                dotIndex === index ? "w-5 bg-foreground" : "w-1 bg-border-strong",
              )}
            />
          ))}
        </div>

        <p className="tnum text-xs font-medium text-secondary-foreground">
          Approx market value: {currency(preview.swapValue)}
        </p>

        <div
          role="status"
          className="flex w-full max-w-[220px] flex-col items-center gap-3 pt-1"
        >
          <div className="h-px w-full overflow-hidden rounded-full bg-border-strong">
            <div className="h-full w-1/4 animate-sweep rounded-full bg-primary" />
          </div>
          <p className="text-xs font-medium text-muted-foreground">
            Preparing your pull — don&rsquo;t refresh
          </p>
        </div>
      </div>
    </Dialog>
  );
}
