import { expect, test } from "@playwright/test";

test("logs into Synapse and loads the users list", async ({ page }) => {
  // Navigate to start page
  await page.goto("/");
  // Wait for redirect to login page
  await page.waitForURL("**/login");

  // Fill login data
  await page.getByLabel("Username").fill("admin");
  await page.locator('input[name="password"]').fill("supersecret");
  await page.getByLabel("Homeserver URL").fill("http://localhost:8008");
  // Expect server version
  await expect (page.getByText("1.141.0")).toBeVisible();

  // Sign in
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  // Expect users table
  await expect(page.getByRole("heading", { name: "Users" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "@admin:localhost" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "admin", exact: true })).toBeVisible();
});
