import assert from "node:assert/strict";
import test from "node:test";
import { drawRecentPull } from "./mock.ts";
import { createMockRecentPullsFeed } from "./recent-pulls-feed.ts";

const pull = (id) => ({ id, title: id, image: "/x.webp", owner: "vaultrat", price: 100 });

function scripted(ids) {
  let index = 0;
  return () => pull(ids[index++ % ids.length]);
}

function collect(feed, count) {
  return new Promise((resolve) => {
    const received = [];
    const unsubscribe = feed.subscribe((next) => {
      received.push(next);
      if (received.length === count) {
        unsubscribe();
        resolve(received);
      }
    });
  });
}

const fast = (next) => createMockRecentPullsFeed({ next, minDelayMs: 1, maxDelayMs: 1 });

test("delivers pulls in order", async () => {
  const received = await collect(fast(scripted(["a", "b", "c"])), 3);
  assert.deepEqual(received.map((item) => item.id), ["a", "b", "c"]);
});

test("unsubscribe stops delivery", async () => {
  const feed = fast(scripted(["a"]));
  let count = 0;
  const unsubscribe = feed.subscribe(() => count++);
  await new Promise((resolve) => setTimeout(resolve, 20));
  unsubscribe();
  const afterUnsubscribe = count;
  assert.ok(afterUnsubscribe > 0, "expected at least one pull before unsubscribing");
  await new Promise((resolve) => setTimeout(resolve, 20));
  assert.equal(count, afterUnsubscribe);
});

test("each subscriber gets its own stream", async () => {
  const feed = fast(scripted(["a"]));
  const [first, second] = await Promise.all([collect(feed, 2), collect(feed, 2)]);
  assert.equal(first.length, 2);
  assert.equal(second.length, 2);
});

test("the mock draws real collectibles with unique ids", async () => {
  const [next, second] = await collect(fast(drawRecentPull), 2);
  assert.notEqual(next.id, second.id);
  assert.ok(next.title.length > 0);
  assert.ok(next.price > 0);
  assert.ok(next.image.startsWith("/media/items/"));
});
