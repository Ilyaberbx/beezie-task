import assert from "node:assert/strict";
import test from "node:test";
import {
  MAX_QUANTITY,
  clampQuantity,
  computeAffordability,
  isAssayingStage,
  isPendingStage,
  isResultStage,
  isSwapWindowExpired,
  orderTotals,
  swapButtonLabel,
} from "./session.ts";

const wallet = (balance) => ({ id: "beezie-wallet", label: "Beezie wallet", balance });
const card = { id: "card", label: "Credit / Debit" };

const afford = (overrides) =>
  computeAffordability({
    price: 50,
    quantity: 2,
    method: wallet(100),
    balanceError: null,
    ...overrides,
  });

test("clampQuantity holds both bounds", () => {
  assert.equal(clampQuantity(0, MAX_QUANTITY), 1);
  assert.equal(clampQuantity(-3, MAX_QUANTITY), 1);
  assert.equal(clampQuantity(MAX_QUANTITY + 1, MAX_QUANTITY), MAX_QUANTITY);
  assert.equal(clampQuantity(4, MAX_QUANTITY), 4);
});

test("orderTotals scales price and points by quantity", () => {
  assert.deepEqual(orderTotals({ price: 50, points: 30 }, 3), { total: 150, points: 90 });
});

test("a method without a balance never blocks the order", () => {
  const result = afford({ method: card });
  assert.equal(result.shortfall, 0);
  assert.equal(result.canAfford, true);
});

test("spending the exact balance is affordable", () => {
  const result = afford();
  assert.equal(result.total, 100);
  assert.equal(result.shortfall, 0);
  assert.equal(result.canAfford, true);
});

test("a short balance reports the gap it leaves", () => {
  const result = afford({ method: wallet(75) });
  assert.equal(result.total, 100);
  assert.equal(result.shortfall, 25);
  assert.equal(result.canAfford, false);
});

test("a rejected purchase keeps its own shortfall and stays unaffordable", () => {
  const result = afford({ balanceError: { shortfall: 40 } });
  assert.equal(result.shortfall, 40);
  assert.equal(result.canAfford, false);
});

test("pending covers the wait and an unbuffered reveal", () => {
  assert.equal(isPendingStage("pending", true), true);
  assert.equal(isPendingStage("revealing", false), true);
  assert.equal(isPendingStage("revealing", true), false);
  assert.equal(isPendingStage("browsing", false), false);
});

test("the result sheet holds through the assay finale", () => {
  assert.equal(isResultStage("revealed"), true);
  assert.equal(isResultStage("swapping"), true);
  assert.equal(isResultStage("settling"), true);
  assert.equal(isResultStage("swapped"), false);
  assert.equal(isResultStage("revealing"), false);
});

test("the assay plays through settling, not just the wait", () => {
  assert.equal(isAssayingStage("swapping"), true);
  assert.equal(isAssayingStage("settling"), true);
  assert.equal(isAssayingStage("revealed"), false);
});

test("the swap window is only expired once a countdown has run out", () => {
  assert.equal(isSwapWindowExpired(null), false);
  assert.equal(isSwapWindowExpired(1), false);
  assert.equal(isSwapWindowExpired(0), true);
  assert.equal(isSwapWindowExpired(-1), true);
});

test("swapButtonLabel covers every branch", () => {
  const base = { expired: false, isSwapping: false, selectedCount: 2, selectedValue: 120 };
  assert.equal(swapButtonLabel({ ...base, expired: true }), "Swap window closed");
  assert.equal(
    swapButtonLabel({ ...base, expired: true, isSwapping: true }),
    "Swap window closed",
  );
  assert.equal(swapButtonLabel({ ...base, isSwapping: true }), "Swap in progress");
  assert.equal(swapButtonLabel({ ...base, selectedCount: 0 }), "Swap");
  assert.equal(swapButtonLabel(base), "Swap 2 items for $120");
  assert.equal(
    swapButtonLabel({ ...base, selectedCount: 1, selectedValue: 60 }),
    "Swap 1 item for $60",
  );
});
