"use client";

import Image from "next/image";
import { asset } from "@/lib/asset";
import { cn } from "@/lib/cn";
import { useStageReady } from "@/hooks/claw/use-stage-ready";
import { usePrefersReducedMotion } from "@/hooks/use-media-query";
import { useMinimumHold } from "@/hooks/use-minimum-hold";

const GATE_FLOOR_MS = 640;
const gateLiftsOnACssCeilingWithoutJs = "animate-gate-out";
const gateLiftsNow = "animate-gate-out-now";

export function PageGate() {
  const stageReady = useStageReady();
  const prefersReducedMotion = usePrefersReducedMotion();
  const heldAsACurtain = useMinimumHold(stageReady, GATE_FLOOR_MS);
  const done = prefersReducedMotion || heldAsACurtain;

  return (
    <div
      aria-hidden
      data-done={done || undefined}
      className={cn(
        "fixed inset-0 z-50 grid place-items-center bg-background",
        done ? gateLiftsNow : gateLiftsOnACssCeilingWithoutJs,
      )}
    >
      <div className="flex flex-col items-center gap-7">
        <Image
          src={asset("/media/beezie-mark.svg")}
          alt=""
          width={22}
          height={32}
          priority
          className="h-12 w-auto"
        />
        <div className="h-px w-32 overflow-hidden rounded-full bg-border-strong">
          <div
            className={cn(
              "h-full w-full origin-left bg-primary",
              done
                ? "scale-x-100 transition-transform duration-200 ease-out"
                : "animate-gate-progress",
            )}
          />
        </div>
      </div>
    </div>
  );
}
