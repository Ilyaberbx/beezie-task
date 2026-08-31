import assert from "node:assert/strict";
import test from "node:test";
import { SwapWindowClosedError, swapPulls } from "./queries.ts";
import { SWAP_POINTS_PER_DOLLAR, SWAP_WINDOW_MS, drawPulls } from "./mock.ts";
import { walletService } from "./wallet-service.ts";

const openWindow = () => Date.now() + SWAP_WINDOW_MS;
const closedWindow = () => Date.now() - 1;

test("a swap past the window is refused and cannot touch the wallet", async () => {
  const before = { ...(await walletService.getWallet()) };
  const pulls = drawPulls(2);

  await assert.rejects(
    () => swapPulls({ pulls, expiresAt: closedWindow() }),
    SwapWindowClosedError,
  );

  assert.deepEqual(await walletService.getWallet(), before);
});

test("a swap inside the window credits value and points", async () => {
  const before = { ...(await walletService.getWallet()) };
  const pulls = drawPulls(3);
  const value = pulls.reduce((sum, pull) => sum + pull.collectible.swapValue, 0);

  const result = await swapPulls({ pulls, expiresAt: openWindow() });

  assert.equal(result.credited, value);
  assert.equal(result.points, Math.round(value * SWAP_POINTS_PER_DOLLAR));

  const after = await walletService.getWallet();
  assert.equal(after.balance, before.balance + value);
  assert.equal(after.points, before.points + result.points);
});
