"use client";

import { useCallback, useSyncExternalStore } from "react";

let enabled = false;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = () => enabled;
const getServerSnapshot = () => false;

export function useSoundPreference() {
  const soundOn = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setSoundOn = useCallback((next: boolean) => {
    if (enabled === next) return;
    enabled = next;
    for (const listener of listeners) listener();
  }, []);

  return [soundOn, setSoundOn] as const;
}
