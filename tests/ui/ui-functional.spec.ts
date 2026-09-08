import { test, expect } from "@playwright/test";
import { LoginPage } from "../../pages/login.page";
import { EditorPage } from "../../pages/editor.page";
import { ArticlePage } from "../../pages/article.page";
import { NavBar } from "../../pages/navbar.component";
import { ConduitAPI } from "../../api/conduit-api";
import { syntheticArticle, syntheticUser } from "../test-data";

test.describe("UI Functional Tests", () => {
  // ─── Test 1: Successful login → create article workflow ─────────────
  test("login and create a new article", async ({ page, request }) => {
    const loginPage = new LoginPage(page);
    const editorPage = new EditorPage(page);
    const articlePage = new ArticlePage(page);
    const navBar = new NavBar(page);
    const api = new ConduitAPI(request);

    // Register test user.
    const testUser = syntheticUser();
    await api.registerUser(testUser.username, testUser.email, testUser.password);

    // Authenticate via UI.
    await loginPage.goto();
    await loginPage.login(testUser.email, testUser.password);

    // Assert authentication.
    await navBar.expectLoggedIn(testUser.username);

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
        const cleanupUser = await api.login(testUser.email, testUser.password);
        await api.deleteArticle(cleanupUser.token, createdSlug);
      }
    }
  });

  // ─── Test 2: Invalid login ─────────────────────────────────────────
  test("shows error on invalid credentials", async ({ page }) => {
    const loginPage = new LoginPage(page);
    const testUser = syntheticUser();

    await loginPage.goto();
    await loginPage.login(testUser.email, testUser.password);

    // Assert error visibility.
    await loginPage.expectErrorVisible();

    // Assert login URL.
    await expect(page).toHaveURL(/\/login/);
  });

  // ─── Test 3: Unauthenticated access to editor ──────────────────────
  test("redirects unauthenticated user away from editor", async ({ page }) => {
    // Attempt unauthenticated access.
    await page.goto("/editor");

    // Assert redirect to login.
    await expect(page).toHaveURL(/\/login$/);
  });
});
