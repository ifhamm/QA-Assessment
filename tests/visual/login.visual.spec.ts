import { test, expect } from "../../fixtures/test-base";

test.use({ storageState: { cookies: [], origins: [] } });

test("login page matches visual baseline", async ({ page, loginPage }) => {
  await loginPage.goto();

  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  await expect(loginPage.emailInput).toBeVisible();

  await expect(page).toHaveScreenshot("login-page.png", {
    fullPage: true,
  });
});
