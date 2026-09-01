import { expect, test, type Page } from "@playwright/test";

/** The purchase settles in ~2.6s and the swap in ~1.8s plus its finale. */
const SETTLE = 25_000;

async function startAndConfirm(page: Page) {
  await page.getByRole("button", { name: "Start Now" }).click();
  const review = page.getByRole("dialog", { name: "Review and pay" });
  await expect(review).toBeVisible();
  await review.getByRole("button", { name: "Confirm" }).click();
  await expect(page.getByRole("dialog", { name: "Preparing your pull" })).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await page.goto("/claw/pokemon-gold/");
  await expect(page.getByRole("heading", { name: "Pokémon Gold Claw", level: 1 })).toBeVisible();
});

test("the quantity stepper stops at its bounds", async ({ page }) => {
  const decrease = page.getByRole("button", { name: "Decrease quantity" });
  const increase = page.getByRole("button", { name: "Increase quantity" });

  await expect(decrease).toBeDisabled();
  await expect(increase).toBeEnabled();

  for (let step = 1; step < 8; step += 1) await increase.click();

  await expect(increase).toBeDisabled();
  await expect(decrease).toBeEnabled();
});

test("one pull reveals a single card and swaps for wallet credit", async ({ page }) => {
  await startAndConfirm(page);

  const result = page.getByRole("dialog", { name: "Your pull", exact: true });
  await expect(result).toBeVisible({ timeout: SETTLE });
  await expect(result.getByText("Swap Value")).toBeVisible();

  await result.getByRole("button", { name: "Swap Now" }).click();

  const success = page.getByRole("dialog", { name: "Swap success" });
  await expect(success).toBeVisible({ timeout: SETTLE });
  await expect(success).toContainText(/\$[\d,]+ has been credited to your wallet\./);
  await expect(success).toContainText(/\+\d+ points/);
});

test("two pulls reveal a grid that bulk-swaps", async ({ page }) => {
  await page.getByRole("button", { name: "Increase quantity" }).click();
  await startAndConfirm(page);

  const result = page.getByRole("dialog", { name: "Your pulls", exact: true });
  await expect(result).toBeVisible({ timeout: SETTLE });
  await expect(result.getByRole("button", { name: /^Swap for \$/ })).toHaveCount(2);

  await result.getByRole("button", { name: "Select all" }).click();
  await expect(result.getByRole("button", { name: "Clear" })).toBeVisible();

  await result.getByRole("button", { name: /^Swap 2 items for \$/ }).click();

  const success = page.getByRole("dialog", { name: "Swap success" });
  await expect(success).toBeVisible({ timeout: SETTLE });
  await expect(success).toContainText(/\$[\d,]+ has been credited to your wallet\./);
});

test("keeping the item closes the reveal and returns to the machine", async ({ page }) => {
  await startAndConfirm(page);

  const result = page.getByRole("dialog", { name: "Your pull", exact: true });
  await expect(result).toBeVisible({ timeout: SETTLE });

  await result.getByRole("button", { name: "Keep Item" }).click();

  await expect(result).toBeHidden();
  await expect(page.getByRole("button", { name: "Start Now" })).toBeEnabled();
});
