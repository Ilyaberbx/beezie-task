import { expect, test, type Page } from "@playwright/test";

const overflowOf = (page: Page, title: string | RegExp) =>
  page
    .locator("section", { has: page.getByRole("heading", { name: title }) })
    .locator('[role="group"]')
    .evaluate((element) => element.scrollHeight - element.clientHeight);

const SIZES = [
  { label: "a phone", width: 390, height: 844 },
  { label: "a small phone", width: 375, height: 667 },
  { label: "a tablet", width: 744, height: 1000 },
  { label: "a laptop", width: 1440, height: 900 },
];

for (const { label, width, height } of SIZES) {
  test(`both feeds have room to scroll on ${label}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/claw/pokemon-gold/");
    await expect(page.getByRole("heading", { name: "Top Items" })).toBeVisible();

    expect(await overflowOf(page, "Top Items")).toBeGreaterThan(0);
    expect(await overflowOf(page, /Recent Pulls/)).toBeGreaterThan(0);
  });
}
