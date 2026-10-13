import { test, expect } from "../../fixtures/test-base";
import { ArticlePage } from "../../pages/article.page";
import { NavBar } from "../../pages/navbar.component";
import { syntheticArticle, syntheticUser } from "../test-data";

test.use({ storageState: { cookies: [], origins: [] } });

test.describe("UI Functional Tests", () => {
  // ─── Test 1: Successful login → create article workflow ─────────────
  test("login and create a new article", async ({
    page,
    api,
    loginPage,
    editorPage,
    user,
  }) => {
    const articlePage = new ArticlePage(page);
    const navBar = new NavBar(page);

    // Authenticate via UI.
    await loginPage.goto();
    await loginPage.login(user.email, user.password);

    // Assert authentication.
    await navBar.expectLoggedIn(user.username);

    // Create article via UI.
    const articleData = syntheticArticle("UICreate");
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
      if (createdSlug) {
        const cleanupUser = await api.login(user.email, user.password);
        await api.deleteArticle(cleanupUser.token, createdSlug);
      }
    }
  });

  // ─── Test 2: Invalid login ─────────────────────────────────────────
  test("shows error on invalid credentials", async ({ page, loginPage }) => {
    const testUser = syntheticUser();

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
    test("redirects unauthenticated user away from editor", async ({ page }) => {
      // Attempt unauthenticated access.
      await page.goto("/editor");

      // Assert redirect to login.
      await expect(page).toHaveURL(/\/login$/);
    });
  });
});
