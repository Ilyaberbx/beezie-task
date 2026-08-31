"use client";

import { useCallback, useSyncExternalStore } from "react";

// One preference for every video on the page: the toggle on the idle stage has
// to govern the reveal overlay too, and they live on opposite sides of a server
// component, so the state sits in the module rather than in a provider.
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
