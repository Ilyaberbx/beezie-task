import assert from "node:assert/strict";
import test from "node:test";
import { MAX_PULL, nextOverscroll } from "./rubber-band.ts";

test("a scroll past the top pulls the content down", () => {
  assert.equal(nextOverscroll(0, -20), 10);
});

test("a scroll past the bottom pulls the content up", () => {
  assert.equal(nextOverscroll(0, 20), -10);
});

test("each further pixel buys less, and the pull never exceeds the cap", () => {
  let offset = 0;
  const steps = [];
  for (let i = 0; i < 40; i += 1) {
    const next = nextOverscroll(offset, -40);
    steps.push(next - offset);
    offset = next;
  }
  assert.ok(steps[1] < steps[0], "the second step gives less than the first");
  assert.ok(offset <= MAX_PULL && offset > MAX_PULL - 1, `settled at ${offset}`);
});

test("scrolling back through neutral hands the gesture back", () => {
  assert.equal(nextOverscroll(10, 200), 0);
  assert.equal(nextOverscroll(-10, -200), 0);
});
