"use client";

import { useSyncExternalStore } from "react";

let ready = false;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = () => ready;
const getServerSnapshot = () => false;

/** The idle machine video can play — the page has everything it was waiting on. */
export function markStageReady() {
  if (ready) return;
  ready = true;
  for (const listener of listeners) listener();
}

export function useStageReady() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
