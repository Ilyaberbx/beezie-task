import { expect, test } from "@playwright/test";

test("More Claw Machines moves to another machine", async ({ page }) => {
  await page.goto("/claw/pokemon-gold/");
  await expect(page.getByRole("heading", { name: "Pokémon Gold Claw", level: 1 })).toBeVisible();

  await page.getByRole("link", { name: "TCG Gold" }).click();

  await expect(page).toHaveURL(/\/claw\/tcg-gold\/?$/);
  await expect(page.getByRole("heading", { name: "TCG Gold Claw", level: 1 })).toBeVisible();
  await expect(page.getByText("$250", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Pokémon Gold" })).toBeVisible();
});

test("an unknown machine renders the 404 page", async ({ page }) => {
  const response = await page.goto("/claw/not-a-machine/");

  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
  await expect(page.getByText("This page could not be found.")).toBeVisible();
});

test("the promo code field expands on a phone and is already open on desktop", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 780 });
  await page.goto("/claw/pokemon-gold/");

  const toggle = page.getByRole("button", { name: "Apply promo code" });
  const input = page.getByLabel("Promo code");

  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(input).toBeHidden();

  await toggle.click();

  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(input).toBeVisible();
  await input.fill("BEEZIE");
  await expect(page.getByRole("button", { name: "Apply", exact: true })).toBeEnabled();

  await page.setViewportSize({ width: 1280, height: 800 });
  await page.reload();
  await expect(page.getByLabel("Promo code")).toBeVisible();
  await expect(page.getByRole("button", { name: "Apply promo code" })).toHaveAttribute(
    "aria-expanded",
    "false",
  );
});
