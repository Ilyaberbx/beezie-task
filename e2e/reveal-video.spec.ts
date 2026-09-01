import { expect, test } from "@playwright/test";

// The chromium-motion project only: with real motion the reveal is an actual
// video the flow has to get through, which is what the preload and stall
// watchdog exist for. Reduced motion skips this overlay entirely.
test("the reveal video plays and hands over to the result", async ({ page }) => {
  test.slow();

  await page.goto("/claw/pokemon-gold/");
  await page.getByRole("button", { name: "Start Now" }).click();

  const review = page.getByRole("dialog", { name: "Review and pay" });
  await expect(review).toBeVisible();
  await review.getByRole("button", { name: "Confirm" }).click();

  const reveal = page.getByRole("dialog", { name: "Revealing your pull" });
  await expect(reveal).toBeVisible({ timeout: 30_000 });

  // The picture has to actually move — a stalled decoder shows the same frame.
  const video = reveal.locator("video");
  await expect
    .poll(() => video.evaluate((element: HTMLVideoElement) => element.currentTime), {
      timeout: 20_000,
      message: "reveal video never advanced past its first frame",
    })
    .toBeGreaterThan(0.3);

  // And it must end somewhere: either the video finishes or the watchdog fires.
  await expect(page.getByRole("dialog", { name: "Your pull", exact: true })).toBeVisible({
    timeout: 60_000,
  });
});

test("every handoff between dialogs keeps a panel on screen", async ({ page }) => {
  test.slow();

  await page.addInitScript(() => {
    const covered: number[] = [];
    Object.assign(window, { __covered: covered });
    const tick = () => {
      const showing = [...document.querySelectorAll("dialog[open]")].some((panel) => {
        const box = panel.getBoundingClientRect();
        return (
          Number(getComputedStyle(panel).opacity) > 0.25 &&
          box.bottom > 4 &&
          box.top < window.innerHeight - 4 &&
          box.right > 4 &&
          box.left < window.innerWidth - 4
        );
      });
      covered.push(showing ? 1 : 0);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

  await page.goto("/claw/pokemon-gold/");
  await page.getByRole("button", { name: "Start Now" }).click();

  const review = page.getByRole("dialog", { name: "Review and pay" });
  await expect(review).toBeVisible();
  await review.getByRole("button", { name: "Confirm" }).click();

  const result = page.getByRole("dialog", { name: "Your pull", exact: true });
  await expect(result).toBeVisible({ timeout: 60_000 });
  await result.getByRole("button", { name: "Swap Now" }).click();

  await expect(page.getByRole("dialog", { name: "Swap success" })).toBeVisible({
    timeout: 30_000,
  });
  await page.waitForTimeout(400);

  const frames = await page.evaluate(() => (window as { __covered?: number[] }).__covered ?? []);
  const first = frames.indexOf(1);
  const last = frames.lastIndexOf(1);
  expect(first).toBeGreaterThanOrEqual(0);

  let longestGap = 0;
  let gap = 0;
  for (const frame of frames.slice(first, last)) {
    gap = frame === 1 ? 0 : gap + 1;
    longestGap = Math.max(longestGap, gap);
  }

  expect(longestGap).toBeLessThanOrEqual(1);
});

test("the video rises from black and returns to it before the handover", async ({ page }) => {
  test.slow();

  await page.addInitScript(() => {
    const samples: number[] = [];
    Object.assign(window, { __opacity: samples });
    const tick = () => {
      const video = document.querySelector<HTMLVideoElement>(
        'dialog[open][aria-label="Revealing your pull"] video',
      );
      if (video) samples.push(Number(getComputedStyle(video).opacity));
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

  await page.goto("/claw/pokemon-gold/");
  await page.getByRole("button", { name: "Start Now" }).click();

  const review = page.getByRole("dialog", { name: "Review and pay" });
  await expect(review).toBeVisible();
  await review.getByRole("button", { name: "Confirm" }).click();

  await expect(page.getByRole("dialog", { name: "Your pull", exact: true })).toBeVisible({
    timeout: 60_000,
  });

  const samples = await page.evaluate(
    () => (window as { __opacity?: number[] }).__opacity ?? [],
  );
  expect(samples.length).toBeGreaterThan(30);

  // Opens on black, reaches the picture, and is back to black at the handover.
  expect(samples[0]).toBeLessThan(0.1);
  expect(Math.max(...samples)).toBeGreaterThan(0.95);
  expect(samples.at(-1)).toBeLessThan(0.5);
});
