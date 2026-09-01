"use client";

import { useSyncExternalStore } from "react";
import { createBooleanStore } from "@/lib/ui/store";

const stageReady = createBooleanStore();

export function markStageReady() {
  stageReady.set(true);
}

export function useStageReady() {
  return useSyncExternalStore(stageReady.subscribe, stageReady.get, stageReady.getServer);
}
