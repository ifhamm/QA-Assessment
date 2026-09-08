import { test, expect } from "@playwright/test";
import { LoginPage } from "../../pages/login.page";
import { EditorPage } from "../../pages/editor.page";
import { ArticlePage } from "../../pages/article.page";
import { NavBar } from "../../pages/navbar.component";
import { ConduitAPI } from "../../api/conduit-api";
import { syntheticArticle, syntheticUser } from "../test-data";

test.describe("Cross-Layer Tests", () => {
  // ─── Test 1: API create → UI verify ─────────────────────────────────
  test("article created via API is visible in the UI", async ({
    page,
    request,
  }) => {
    const api = new ConduitAPI(request);
    const articlePage = new ArticlePage(page);
    const loginPage = new LoginPage(page);
    const navBar = new NavBar(page);

    // Register test user.
    const testUser = syntheticUser();
    await api.registerUser(testUser.username, testUser.email, testUser.password);

    // Create article via API.
    const user = await api.login(testUser.email, testUser.password);
    const data = syntheticArticle("APICreate");
    const created = await api.createArticle(user.token, data);

    try {
      // Authenticate via UI.
      await loginPage.goto();
      await loginPage.login(testUser.email, testUser.password);
      await navBar.expectLoggedIn(testUser.username);
      
      // Navigate to article.
      await page.goto(`/article/${created.slug}`);

      // Assert UI content.
      await articlePage.expectTitle(created.title);
      await articlePage.expectBodyContains(data.body.replace(/\*\*/g, ""));
    } finally {
      // Teardown: delete article.
      const cleanupUser = await api.login(testUser.email, testUser.password);
      await api.deleteArticle(cleanupUser.token, created.slug);
    }
  });

  // ─── Test 2: UI update → API verify ─────────────────────────────────
  test("article updated via UI is reflected in the API", async ({
    page,
    request,
  }) => {
    const api = new ConduitAPI(request);
    const loginPage = new LoginPage(page);
    const editorPage = new EditorPage(page);
    const articlePage = new ArticlePage(page);
    const navBar = new NavBar(page);

    // Register test user.
    const testUser = syntheticUser();
    await api.registerUser(testUser.username, testUser.email, testUser.password);

    // Authenticate and create article via API.
    const user = await api.login(testUser.email, testUser.password);
    const original = syntheticArticle("UIUpdate");
    const created = await api.createArticle(user.token, original);

    let finalSlug = created.slug;
    try {
      // Authenticate via UI.
      await loginPage.goto();
      await loginPage.login(testUser.email, testUser.password);
      await navBar.expectLoggedIn(testUser.username);

      // Navigate to article editor.
      await editorPage.goto(created.slug);

      // Assert initial form data.
      await expect(editorPage.titleInput).toHaveValue(original.title, {
        timeout: 10000,
      });

      // Update article via UI.
      const updatedTitle = `Updated ${original.title}`;
      const updatedBody = `Updated body content ${Date.now()}`;
      await editorPage.updateTitle(updatedTitle);
      await editorPage.updateBody(updatedBody);
      await editorPage.publish();

      // Assert redirection.
      await expect(page).toHaveURL(/\/article\//, { timeout: 10000 });

      // Assert UI content.
      await articlePage.expectTitle(updatedTitle);

      // Extract new slug.
      const currentUrl = new URL(page.url());
      const pathParts = currentUrl.pathname.split("/article/");
      finalSlug = pathParts[pathParts.length - 1];

      // Assert API content.
      const freshUser = await api.login(testUser.email, testUser.password);
      const apiArticle = await api.getArticle(finalSlug, freshUser.token);
      expect(apiArticle.title).toBe(updatedTitle);
      expect(apiArticle.body).toBe(updatedBody);
    } finally {
      // Teardown: delete articles.
      const cleanupUser = await api.login(testUser.email, testUser.password);
      await api.deleteArticle(cleanupUser.token, finalSlug);
      if (finalSlug !== created.slug) {
        await api.deleteArticle(cleanupUser.token, created.slug);
      }
    }
  });
});
