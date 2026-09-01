import assert from "node:assert/strict";
import test from "node:test";
import {
  PULL_WINDOW,
  insertLivePull,
  livePullRowState,
  seedLivePullWindow,
  settleLivePull,
  trimLivePulls,
} from "./live-pulls.ts";

const pull = (id) => ({ id, title: id, image: `/${id}.webp`, owner: "someone", price: 10 });

const filled = () => seedLivePullWindow(Array.from({ length: 10 }, (_, i) => pull(`p${i}`)));

test("the seed fills the window and nothing is live", () => {
  const list = filled();
  assert.equal(list.length, PULL_WINDOW);
  assert.equal(list[0].id, "p0");
  assert.ok(list.every((row) => row.isLive === false));
});

test("an arrival lands on top as live and overhangs the window by one", () => {
  const list = insertLivePull(filled(), pull("new"));
  assert.equal(list.length, PULL_WINDOW + 1);
  assert.equal(list[0].id, "new");
  assert.equal(list[0].isLive, true);
  assert.equal(list[1].isLive, false);
});

test("trimming drops the overhanging row", () => {
  const list = trimLivePulls(insertLivePull(filled(), pull("new")));
  assert.equal(list.length, PULL_WINDOW);
  assert.equal(list.at(-1).id, `p${PULL_WINDOW - 2}`);
});

test("settling clears the live flag on that row only", () => {
  const arrived = insertLivePull(insertLivePull(filled(), pull("a")), pull("b"));
  const settled = settleLivePull(arrived, "b");
  assert.equal(settled.find((row) => row.id === "b").isLive, false);
  assert.equal(settled.find((row) => row.id === "a").isLive, true);
});

test("settling an id that is gone leaves the list alone", () => {
  const list = filled();
  assert.deepEqual(settleLivePull(list, "missing"), list);
});

test("row state marks the arrival, the last kept row and the overhang", () => {
  assert.equal(livePullRowState(0, true), "entering");
  assert.equal(livePullRowState(0, false), undefined);
  assert.equal(livePullRowState(PULL_WINDOW - 1, false), undefined);
  assert.equal(livePullRowState(PULL_WINDOW - 1, true), "entering");
  assert.equal(livePullRowState(PULL_WINDOW, false), "leaving");
  assert.equal(livePullRowState(PULL_WINDOW, true), "leaving");
});
