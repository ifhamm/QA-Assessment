import { test, expect } from "../../fixtures/test-base";

test("opens the dashboard as an authenticated user", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page).not.toHaveURL(/\/login/);
  await expect(
    page.getByRole("link", { name: "New Article" })
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Sign in" })
  ).not.toBeVisible();
});
