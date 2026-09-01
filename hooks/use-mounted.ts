"use client";

import { useSyncExternalStore } from "react";

const noSubscription = () => () => {};
const onClient = () => true;
const onServer = () => false;

export function useMounted() {
  return useSyncExternalStore(noSubscription, onClient, onServer);
}
