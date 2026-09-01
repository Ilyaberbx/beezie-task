import assert from "node:assert/strict";
import test from "node:test";
import { MORPH_EPSILON_PX, boxesDiffer } from "./box.ts";

const box = (w, h) => ({ w, h });

test("a box does not differ from itself", () => {
  assert.equal(boxesDiffer(box(400, 300), box(400, 300), MORPH_EPSILON_PX), false);
});

test("a width inside the tolerance is not a difference", () => {
  assert.equal(boxesDiffer(box(400, 300), box(401, 300), MORPH_EPSILON_PX), false);
});

test("a width past the tolerance is a difference", () => {
  assert.equal(boxesDiffer(box(400, 300), box(402, 300), MORPH_EPSILON_PX), true);
  assert.equal(boxesDiffer(box(400, 300), box(398, 300), MORPH_EPSILON_PX), true);
});

test("height is compared independently of width", () => {
  assert.equal(boxesDiffer(box(400, 300), box(400, 301), MORPH_EPSILON_PX), false);
  assert.equal(boxesDiffer(box(400, 300), box(400, 302), MORPH_EPSILON_PX), true);
});

test("either axis on its own is enough", () => {
  assert.equal(boxesDiffer(box(400, 300), box(600, 300), MORPH_EPSILON_PX), true);
  assert.equal(boxesDiffer(box(400, 300), box(400, 600), MORPH_EPSILON_PX), true);
});
