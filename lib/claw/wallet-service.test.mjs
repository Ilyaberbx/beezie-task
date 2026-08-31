import assert from "node:assert/strict";
import test from "node:test";
import {
  InsufficientBalanceError,
  createInMemoryWalletService,
} from "./wallet-service.ts";

const seed = () => createInMemoryWalletService({ balance: 2500, points: 20000 });

test("debit reduces the balance and persists it", async () => {
  const wallet = seed();
  const after = await wallet.debit({ amount: 500, reason: "test" });
  assert.equal(after.balance, 2000);
  assert.equal((await wallet.getWallet()).balance, 2000);
});

test("debit refuses to overdraw and leaves the balance untouched", async () => {
  const wallet = seed();
  await assert.rejects(
    () => wallet.debit({ amount: 2501, reason: "test" }),
    (error) => {
      assert.ok(error instanceof InsufficientBalanceError);
      assert.equal(error.available, 2500);
      assert.equal(error.required, 2501);
      assert.equal(error.shortfall, 1);
      return true;
    },
  );
  assert.equal((await wallet.getWallet()).balance, 2500);
});

test("spending the exact balance is allowed and lands on zero", async () => {
  const wallet = seed();
  assert.equal((await wallet.debit({ amount: 2500, reason: "test" })).balance, 0);
});

test("credit returns funds and awards points", async () => {
  const wallet = seed();
  await wallet.debit({ amount: 2500, reason: "test" });
  const after = await wallet.credit({ amount: 360, points: 36, reason: "test" });
  assert.equal(after.balance, 360);
  assert.equal(after.points, 20036);
  assert.equal((await wallet.getWallet()).balance, 360);
});

test("a debit followed by its credit is a round trip", async () => {
  const wallet = seed();
  await wallet.debit({ amount: 500, reason: "test" });
  const after = await wallet.credit({ amount: 500, reason: "test" });
  assert.equal(after.balance, 2500);
  assert.equal(after.points, 20000);
});
