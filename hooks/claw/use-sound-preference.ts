"use client";

import { useSyncExternalStore } from "react";
import { createBooleanStore } from "@/lib/ui/store";

const sharedAcrossStageAndReveal = createBooleanStore();

export function useSoundPreference() {
  const soundOn = useSyncExternalStore(
    sharedAcrossStageAndReveal.subscribe,
    sharedAcrossStageAndReveal.get,
    sharedAcrossStageAndReveal.getServer,
  );

  return [soundOn, sharedAcrossStageAndReveal.set] as const;
}
