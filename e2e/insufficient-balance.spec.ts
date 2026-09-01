import { expect, test } from "@playwright/test";

// One $500 pull against the $50 external wallet.
test("a wallet that cannot cover the order blocks Confirm until another is picked", async ({
  page,
}) => {
  await page.goto("/claw/pokemon-gold/");
  await page.getByRole("button", { name: "Start Now" }).click();

  const review = page.getByRole("dialog", { name: "Review and pay" });
  await expect(review).toBeVisible();

  const confirm = review.getByRole("button", { name: "Confirm" });
  await expect(confirm).toBeEnabled();

  // Two copies of the payment list ship, one per breakpoint; click the shown one.
  await review.getByText("External wallet", { exact: true }).filter({ visible: true }).click();
  await expect(review.getByRole("radio", { name: /External wallet/ })).toBeChecked();

  const alert = review.getByRole("alert");
  await expect(alert).toBeVisible();
  await expect(alert).toContainText("Not enough in your External wallet");
  await expect(alert).toContainText("$450 short");

  await expect(confirm).toBeDisabled();
  const describedBy = await confirm.getAttribute("aria-describedby");
  expect(describedBy).toBeTruthy();
  await expect(alert).toHaveAttribute("id", describedBy!);

  await alert.getByRole("button", { name: "Pay with Credit / Debit" }).click();

  await expect(review.getByRole("alert")).toHaveCount(0);
  await expect(confirm).toBeEnabled();
  await expect(confirm).not.toHaveAttribute("aria-describedby");
});
