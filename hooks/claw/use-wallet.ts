"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { clawQueries } from "@/lib/claw/queries";

export function useWallet() {
  return useSuspenseQuery(clawQueries.wallet()).data;
}
