import { expect, test } from "@playwright/test";

/**
 * Reads the shipped keyframes back out of the browser. The assay's filter lists
 * have to name the same functions in the same order at every stop: mismatched
 * lists interpolate discretely, so the artwork snaps to grey instead of draining
 * and the animation drops off the compositor.
 */
async function grayscaleOverDrain(page: import("@playwright/test").Page) {
  return page.evaluate(() => {
    const probe = document.createElement("div");
    probe.style.cssText =
      "position:fixed;width:1px;height:1px;animation:assay-drain 620ms linear both;animation-play-state:paused";
    document.body.append(probe);

    const samples: number[] = [];
    for (let percent = 0; percent <= 100; percent += 5) {
      // A negative delay of the full duration reads as not-yet-started, so stop just short.
      probe.style.animationDelay = `-${Math.min((620 * percent) / 100, 619.9)}ms`;
      const filter = getComputedStyle(probe).filter;
      const match = /grayscale\(([\d.]+)\)/.exec(filter);
      // No grayscale() at all means the list changed shape mid-animation.
      samples.push(match ? Number(match[1]) : NaN);
    }
    probe.remove();
    return samples;
  });
}

// The default lane pins every animation with `animation-delay: 0.01ms !important`,
// which would hold the probe at its first frame.
test.describe("with motion allowed", () => {
  test.use({ contextOptions: { reducedMotion: "no-preference" } });

  test("the assay drains grayscale continuously, never in one jump", async ({ page }) => {
    await page.goto("/claw/tcg-silver/");
    await page.getByRole("heading", { level: 1 }).first().waitFor();

    const samples = await grayscaleOverDrain(page);

    expect(samples.some(Number.isNaN)).toBe(false);
    expect(samples.at(0)).toBeCloseTo(0, 3);
    expect(samples.at(-1)).toBeCloseTo(0.85, 2);

    const steps = samples.slice(1).map((value, index) => value - samples[index]);
    expect(Math.min(...steps)).toBeGreaterThanOrEqual(-0.001);
    // A discrete swap moves the whole 0.85 in one 5% step.
    expect(Math.max(...steps)).toBeLessThan(0.2);
  });

  test("the scan starts held at the top of the card, not parked mid-card", async ({ page }) => {
    await page.goto("/claw/tcg-silver/");
    await page.getByRole("heading", { level: 1 }).first().waitFor();
    await page.getByRole("button", { name: "Increase quantity" }).click();

    await page.getByRole("button", { name: "Start Now" }).click();
    const review = page.getByRole("dialog", { name: "Review and pay" });
    await review.waitFor();
    await review.getByRole("button", { name: "Confirm" }).click();

    const result = page.getByRole("dialog", { name: "Your pulls", exact: true });
    await result.waitFor({ timeout: 30_000 });
    await result.getByRole("button", { name: "Select all" }).click();
    await result.getByRole("button", { name: /^Swap 2 items for \$/ }).click();
    await page.locator("[data-assay-scan]").first().waitFor();

    // Read the first frame off the animation itself rather than racing the stagger.
    const bars = await page.evaluate(() =>
      [...document.querySelectorAll("[data-assay-scan]")].map((el) => {
        const animation = el.getAnimations()[0];
        animation.pause();
        animation.currentTime = 0;
        const card = el.parentElement!.parentElement!.getBoundingClientRect();
        const bar = el.getBoundingClientRect();
        return {
          fill: getComputedStyle(el).animationFillMode,
          // Where the bar's leading edge sits in the card, 0 = flush with the top.
          leadingEdgePct: ((bar.bottom - card.top) / card.height) * 100,
        };
      }),
    );

    expect(bars.length).toBeGreaterThan(0);
    for (const bar of bars) {
      // Without a backwards fill the staggered cards show an un-animated bar.
      expect(bar.fill).toBe("backwards");
      expect(bar.leadingEdgePct).toBeGreaterThan(-1);
      expect(bar.leadingEdgePct).toBeLessThan(4);
    }
  });
});

test("the live pull feed stops arriving behind a dialog and resumes after it", async ({ page }) => {
  const rows = () => page.locator("[data-pull]").count();

  await page.goto("/claw/tcg-silver/");
  await page.getByRole("heading", { level: 1 }).first().waitFor();
  await expect.poll(rows, { timeout: 20_000 }).toBeGreaterThan(0);

  await page.getByRole("button", { name: "Start Now" }).click();
  const review = page.getByRole("dialog", { name: "Review and pay" });
  await expect(review).toBeVisible();

  const parked = await rows();
  await page.waitForTimeout(6000);
  expect(await rows()).toBe(parked);

  await review.getByRole("button", { name: "Close" }).click();
  await expect(review).toBeHidden();
  await expect.poll(rows, { timeout: 20_000 }).not.toBe(parked);
});
