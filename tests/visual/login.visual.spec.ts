import { test, expect } from "@playwright/test";

test("login page matches visual baseline", async ({ page }) => {
    await page.goto("/login");

    await expect(
        page.getByRole("heading", { name: "Sign in" })
    ).toBeVisible();

    await expect(
        page.getByPlaceholder("Email")
    ).toBeVisible();

    await expect(page).toHaveScreenshot("login-page.png", {
        fullPage: true,
    });
});