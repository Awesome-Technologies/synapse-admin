import { expect, test } from "@playwright/test";

test("logs into Synapse and loads the users list", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByLabel("Username")).toBeVisible({ timeout: 60000 });
  await page.getByLabel("Username").fill("admin");
  await page.locator('input[name="password"]').fill("supersecret");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();

  await expect(page.getByRole("heading", { name: "Users" })).toBeVisible();
  await expect(page.getByText("@admin:localhost")).toBeVisible();
});
