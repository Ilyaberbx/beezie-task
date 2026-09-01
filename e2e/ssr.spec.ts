import { expect, test } from "@playwright/test";

// JavaScript off: everything asserted here has to be in the HTML the server
// hands over, not something hydration paints in afterwards.
test.use({ javaScriptEnabled: false });

const ODDS_TIERS = ["Ultra-Rare", "Rare", "Uncommon", "Common", "Base"];

test("the default machine page is served fully rendered", async ({ page }) => {
  await page.goto("/claw/pokemon-gold/");

  await expect(page.getByRole("heading", { name: "Pokémon Gold Claw", level: 1 })).toBeVisible();
  await expect(page.getByText(/Every pull is a statement piece/)).toBeVisible();
  await expect(page.getByText("$500", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("+250 points")).toBeVisible();

  for (const tier of ODDS_TIERS) {
    await expect(page.getByText(tier, { exact: true }).first()).toBeVisible();
  }
  await expect(page.getByRole("heading", { name: "Odds" })).toBeVisible();

  await expect(page.getByRole("heading", { name: "Top Items" })).toBeVisible();
  await expect(
    page.getByText("2016 Japanese Promo Poncho Wear Pikachu #231 PSA 10").first(),
  ).toBeVisible();

  await expect(page.getByRole("heading", { name: /Recent Pulls/ })).toBeVisible();
  await expect(page.getByText("lebnani")).toBeVisible();
  await expect(page.getByText("0xhoneycomb")).toBeVisible();
  await expect(
    page.getByText("2021 Evolving Skies Rayquaza VMAX #218 PSA 10").first(),
  ).toBeVisible();

  await expect(page.getByRole("heading", { name: "More Claw Machines" })).toBeVisible();
  for (const sibling of ["TCG Gold", "TCG Silver", "Wildcard"]) {
    await expect(page.getByRole("link", { name: sibling })).toBeVisible();
  }

  const header = page.getByRole("banner");
  await expect(header.getByRole("link", { name: "Beezie home" })).toBeVisible();
  await expect(header.getByRole("link", { name: "Marketplace" })).toBeVisible();
  await expect(header.getByRole("link", { name: "Claw" })).toHaveAttribute(
    "aria-current",
    "page",
  );
});

test("a non-default machine is served fully rendered too", async ({ page }) => {
  await page.goto("/claw/tcg-silver/");

  await expect(page.getByRole("heading", { name: "TCG Silver Claw", level: 1 })).toBeVisible();
  await expect(page.getByText(/An everyday pull with real slabs/)).toBeVisible();
  await expect(page.getByText("$50", { exact: true }).first()).toBeVisible();

  for (const tier of ODDS_TIERS) {
    await expect(page.getByText(tier, { exact: true }).first()).toBeVisible();
  }
  await expect(page.getByRole("heading", { name: "Top Items" })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Recent Pulls/ })).toBeVisible();
  await expect(page.getByRole("link", { name: "Pokémon Gold" })).toBeVisible();
});
