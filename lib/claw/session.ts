import { currency } from "../format.ts";
import { shortfallFor } from "./wallet-service.ts";
import type { PaymentMethod } from "./types";

export type SessionStage =
  | "browsing"
  | "reviewing"
  | "pending"
  | "revealing"
  | "revealed"
  | "swapping"
  | "settling"
  | "swapped";

export const MAX_QUANTITY = 8;

export type Affordability = {
  total: number;
  shortfall: number;
  canAfford: boolean;
};

export type AffordabilityInput = {
  price: number;
  quantity: number;
  method: PaymentMethod | undefined;
  balanceError: { shortfall: number } | null;
};

export function clampQuantity(n: number, max: number) {
  return Math.min(max, Math.max(1, n));
}

export function orderTotals(
  machine: { price: number; points: number },
  quantity: number,
) {
  return { total: machine.price * quantity, points: machine.points * quantity };
}

export function computeAffordability({
  price,
  quantity,
  method,
  balanceError,
}: AffordabilityInput): Affordability {
  const total = price * quantity;
  const shortfall = shortfallFor(method?.balance, total);

  return {
    total,
    shortfall: balanceError?.shortfall ?? shortfall,
    canAfford: shortfall === 0 && balanceError === null,
  };
}

export function isPendingStage(stage: SessionStage, revealReady: boolean) {
  return stage === "pending" || (stage === "revealing" && !revealReady);
}

export function isResultStage(stage: SessionStage) {
  return stage === "revealed" || stage === "swapping" || stage === "settling";
}

export function isAssayingStage(stage: SessionStage) {
  return stage === "swapping" || stage === "settling" || stage === "swapped";
}

export function isSwapWindowExpired(remainingMs: number | null) {
  return remainingMs !== null && remainingMs <= 0;
}

export function swapButtonLabel({
  expired,
  isSwapping,
  selectedCount,
  selectedValue,
}: {
  expired: boolean;
  isSwapping: boolean;
  selectedCount: number;
  selectedValue: number;
}) {
  if (expired) return "Swap window closed";
  if (isSwapping) return "Swap in progress";
  if (selectedCount === 0) return "Swap";
  return `Swap ${selectedCount} item${selectedCount > 1 ? "s" : ""} for ${currency(selectedValue)}`;
}
