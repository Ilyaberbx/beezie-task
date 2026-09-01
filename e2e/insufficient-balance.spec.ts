import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/claw/pokemon-gold/");
});

// The $50 external wallet cannot cover a single $500 pull.
test("a wallet that cannot cover the order is not selectable", async ({ page }) => {
  await page.getByRole("button", { name: "Start Now" }).click();

  const review = page.getByRole("dialog", { name: "Review and pay" });
  await expect(review).toBeVisible();

  const external = review.getByRole("radio", { name: /External wallet/ });
  await expect(external).toBeDisabled();

  await review
    .getByText("External wallet", { exact: true })
    .filter({ visible: true })
    .click({ force: true });
  await expect(external).not.toBeChecked();

  await expect(review.getByRole("button", { name: "Confirm" })).toBeEnabled();
  await expect(review.getByRole("alert")).toHaveCount(0);
});

// Six $500 pulls outrun the $2,500 Beezie wallet the dialog opens on.
test("outgrowing the selected wallet renames Confirm instead of explaining itself", async ({
  page,
}) => {
  const increase = page.getByRole("button", { name: "Increase quantity" });
  for (let step = 1; step < 6; step += 1) await increase.click();

  await page.getByRole("button", { name: "Start Now" }).click();

  const review = page.getByRole("dialog", { name: "Review and pay" });
  await expect(review).toBeVisible();
  await expect(review.getByRole("radio", { name: /Beezie wallet/ })).toBeDisabled();

  const blocked = review.getByRole("button", { name: "Not enough balance" });
  await expect(blocked).toBeVisible();
  await expect(blocked).toBeDisabled();
  await expect(review.getByRole("alert")).toHaveCount(0);

  await review.getByText("Credit / Debit", { exact: true }).filter({ visible: true }).click();
  await expect(review.getByRole("button", { name: "Confirm" })).toBeEnabled();
});
