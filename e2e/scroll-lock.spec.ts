import { expect, test } from "@playwright/test";

// iOS kept scrolling the claw page behind an open dialog, so the lock now pins
// the body. It has to hold the page still *and* hand the offset back on close.
// The click is dispatched rather than performed: a real click would scroll the
// button into view first and undo the scrolling this test is about.
test("an open dialog freezes the page and restores where it left off", async ({ page }) => {
  await page.goto("/claw/pokemon-gold/");
  await expect(page.getByRole("heading", { name: "Pokémon Gold Claw", level: 1 })).toBeVisible();

  await page.evaluate(() => window.scrollTo(0, 400));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(400);

  await page.getByRole("button", { name: "Start Now" }).dispatchEvent("click");
  const review = page.getByRole("dialog", { name: "Review and pay" });
  await expect(review).toBeVisible();

  // The pin is the part iOS needs; overflow:hidden alone would pass the rest here.
  expect(await page.evaluate(() => document.body.style.position)).toBe("fixed");

  const anchored = await page.evaluate(() => document.querySelector("main")!.getBoundingClientRect().top);
  await page.mouse.wheel(0, 600);
  await page.waitForTimeout(200);
  expect(
    await page.evaluate(() => document.querySelector("main")!.getBoundingClientRect().top),
  ).toBeCloseTo(anchored, 0);

  await page.keyboard.press("Escape");
  await expect(review).toBeHidden();
  expect(await page.evaluate(() => document.body.style.position)).toBe("");
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(400);
});
