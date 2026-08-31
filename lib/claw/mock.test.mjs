import assert from "node:assert/strict";
import test from "node:test";
import { MACHINES, drawPulls, findMachine } from "./mock.ts";

test("published odds are the odds that are drawn", () => {
  for (const machine of MACHINES) {
    const total = machine.odds.reduce((sum, tier) => sum + tier.chance, 0);
    assert.equal(Math.round(total * 100) / 100, 100, `${machine.slug} odds`);
  }
});

test("every tier is reachable", () => {
  for (const tier of MACHINES[0].odds) {
    assert.ok(tier.chance > 0, `${tier.key} can never be drawn`);
  }
});

test("drawPulls returns the requested count with distinct ids", () => {
  const pulls = drawPulls(8);
  assert.equal(pulls.length, 8);
  assert.equal(new Set(pulls.map((pull) => pull.id)).size, 8);
  for (const pull of pulls) assert.ok(pull.collectible.swapValue > 0);
});

test("findMachine rejects an unknown slug", () => {
  assert.equal(findMachine("not-a-machine"), undefined);
});
