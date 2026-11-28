import { test, expect } from "../../fixtures/test-base";
import { bestEffortCleanup } from "../cleanup";
import { syntheticArticle, syntheticUser } from "../test-data";

test.use({ storageState: { cookies: [], origins: [] } });

test.describe("UI Functional Tests", () => {
  test("login and create a new article @smoke", async ({
    page,
    api,
    loginPage,
    editorPage,
    articlePage,
    navBar,
    user,
  }) => {
    await loginPage.goto();
    await loginPage.login(user.email, user.password);

    await navBar.expectLoggedIn(user.username);

    const articleData = syntheticArticle(
      "UICreate",
      test.info().workerIndex
    );
    await editorPage.goto();
    await editorPage.fillArticle(articleData);
    
    let createdSlug = "";
    try {
      await editorPage.publish();

      await expect(page).toHaveURL(/\/article\//);

      const pathname = new URL(page.url()).pathname;
      createdSlug = pathname.split("/article/").pop()!;

      await articlePage.expectTitle(articleData.title);
      await articlePage.expectBodyContains(articleData.body.replace(/\*\*/g, ""));
    } finally {
      // This article is created through the UI, so the test owns its cleanup.
      // The UI login above replaced the user's API token, so log in again.
      // If the redirect assertion failed, recover the slug from the URL so a
      // successfully published article is still deleted.
      const slugFromUrl = page.url().match(/\/article\/([^/?#]+)/)?.[1];
      const slug = createdSlug || slugFromUrl;
      if (slug) {
        await bestEffortCleanup(`UI-created article ${slug}`, async () => {
          const cleanupUser = await api.login(user.email, user.password);
          await api.deleteArticle(cleanupUser.token, slug);
        });
      }
    }
  });

  test("shows error on invalid credentials @regression", async ({ page, loginPage }) => {
    const testUser = syntheticUser(test.info().workerIndex);

    await loginPage.goto();
    await loginPage.login(testUser.email, testUser.password);

    await loginPage.expectErrorVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test.describe("Unauthenticated access", () => {
    test("redirects unauthenticated user away from editor @regression", async ({ page }) => {
      await page.goto("/editor");
      await expect(page).toHaveURL(/\/login$/);
    });
  });
});
