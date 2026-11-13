import { test, expect } from "../../fixtures/test-base";
import { bestEffortCleanup } from "../cleanup";
import { syntheticArticle, syntheticUser } from "../test-data";

test.use({ storageState: { cookies: [], origins: [] } });

test.describe("UI Functional Tests", () => {
  // ─── Test 1: Successful login → create article workflow ─────────────
  test("login and create a new article @smoke", async ({
    page,
    api,
    loginPage,
    editorPage,
    articlePage,
    navBar,
    user,
  }) => {
    // Authenticate via UI.
    await loginPage.goto();
    await loginPage.login(user.email, user.password);

    // Assert authentication.
    await navBar.expectLoggedIn(user.username);

    // Create article via UI.
    const articleData = syntheticArticle(
      "UICreate",
      test.info().workerIndex
    );
    await editorPage.goto();
    await editorPage.fillArticle(articleData);
    
    let createdSlug = "";
    try {
      await editorPage.publish();

      // Assert redirection and content.
      await expect(page).toHaveURL(/\/article\//);

      // Extract slug for teardown.
      const pathname = new URL(page.url()).pathname;
      createdSlug = pathname.split("/article/").pop()!;

      // Assert content.
      await articlePage.expectTitle(articleData.title);
      await articlePage.expectBodyContains(articleData.body.replace(/\*\*/g, ""));
    } finally {
      // Teardown: delete article.
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

  // ─── Test 2: Invalid login ─────────────────────────────────────────
  test("shows error on invalid credentials @regression", async ({ page, loginPage }) => {
    const testUser = syntheticUser(test.info().workerIndex);

    await loginPage.goto();
    await loginPage.login(testUser.email, testUser.password);

    // Assert error visibility.
    await loginPage.expectErrorVisible();

    // Assert login URL.
    await expect(page).toHaveURL(/\/login/);
  });

  test.describe("Unauthenticated access", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    // ─── Test 3: Unauthenticated access to editor ──────────────────────
    test("redirects unauthenticated user away from editor @regression", async ({ page }) => {
      // Attempt unauthenticated access.
      await page.goto("/editor");

      // Assert redirect to login.
      await expect(page).toHaveURL(/\/login$/);
    });
  });
});
