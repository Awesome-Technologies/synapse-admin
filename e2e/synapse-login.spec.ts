import { expect, test } from "@playwright/test";

test("logs into Synapse and loads the users list", async ({ page }) => {
  await page.goto("/");

  await page.getByLabel("Username").fill("admin");
  await page.locator('input[name="password"]').fill("supersecret");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page.getByText("@admin:localhost")).toBeVisible();
  await expect(page.getByRole("link", { name: "Users" })).toBeVisible();
});
