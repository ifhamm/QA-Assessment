import { test, expect } from "../../fixtures/test-base";

test("opens the dashboard as an authenticated user @smoke", async ({
  page,
  navBar,
}) => {
  await page.goto("/");

  await expect(page).not.toHaveURL(/\/login/);
  await expect(navBar.newArticleLink()).toBeVisible();
  await expect(navBar.signInLink()).not.toBeVisible();
});
