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
