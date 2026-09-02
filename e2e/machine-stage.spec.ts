import { expect, test } from "@playwright/test";

const idleVideo = 'video[aria-label="Pokémon Gold Claw machine"]';
const isPaused = (page: import("@playwright/test").Page) =>
  page.locator(idleVideo).evaluate((element: HTMLVideoElement) => element.paused);

test.beforeEach(async ({ page }) => {
  await page.goto("/claw/pokemon-gold/");
  await expect(page.getByRole("heading", { name: "Pokémon Gold Claw", level: 1 })).toBeVisible();
});

test("the stage toggles report their state", async ({ page }) => {
  const sound = page.getByRole("button", { name: /^Sound o/ });
  await expect(sound).toHaveAttribute("aria-pressed", "false");
  await sound.click();
  await expect(page.getByRole("button", { name: "Sound on" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );

  const animation = page.getByRole("button", { name: "Animation on" });
  await expect(animation).toHaveAttribute("aria-pressed", "true");
  await animation.click();
  await expect(page.getByRole("button", { name: "Animation off" })).toHaveAttribute(
    "aria-pressed",
    "false",
  );
});

test("the stage toggles keep their footprint when their state flips", async ({ page }) => {
  const sound = page.getByRole("button", { name: /^Sound o/ });
  const animation = page.getByRole("button", { name: /^Animation o/ });

  const span = async () => {
    const [a, b] = [await sound.boundingBox(), await animation.boundingBox()];
    return { x: a!.x, width: a!.width, animationX: b!.x, animationWidth: b!.width };
  };

  const before = await span();

  await sound.click();
  await expect(sound).toHaveAttribute("aria-pressed", "true");
  await animation.click();
  await expect(animation).toHaveAttribute("aria-pressed", "false");

  expect(await span()).toEqual(before);
});

test("the idle machine video pauses behind a dialog and resumes after it", async ({ page }) => {
  await expect.poll(() => isPaused(page), { timeout: 20_000 }).toBe(false);

  await page.getByRole("button", { name: "Start Now" }).click();
  const review = page.getByRole("dialog", { name: "Review and pay" });
  await expect(review).toBeVisible();
  await expect.poll(() => isPaused(page), { timeout: 10_000 }).toBe(true);

  await review.getByRole("button", { name: "Close" }).click();
  await expect(review).toBeHidden();
  await expect.poll(() => isPaused(page), { timeout: 10_000 }).toBe(false);
});
