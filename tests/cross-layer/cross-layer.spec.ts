import { test, expect } from "../../fixtures/test-base";

test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Cross-Layer Tests", () => {
  // ─── Test 1: API create → UI verify ─────────────────────────────────
  test("article created via API is visible in the UI", async ({
    authenticatedPage: page,
    user,
    articlePage,
    navBar,
    article,
  }) => {
    // The user and the article are prepared by fixtures. The browser session
    // is authenticated by injecting the test user's token, not by a UI login.
    await page.goto(`/article/${article.created.slug}`);
    await navBar.expectLoggedIn(user.username);

    // Assert UI content.
    await articlePage.expectTitle(article.created.title);
    await articlePage.expectBodyContains(
      article.data.body.replace(/\*\*/g, "")
    );
  });

  // ─── Test 2: UI update → API verify ─────────────────────────────────
  test("article updated via UI is reflected in the API", async ({
    authenticatedPage: page,
    api,
    user,
    editorPage,
    articlePage,
    navBar,
    article,
  }) => {
    await editorPage.goto(article.created.slug);
    await navBar.expectLoggedIn(user.username);

    // Assert initial form data.
    await expect(editorPage.titleInput).toHaveValue(article.data.title, {
      timeout: 10000,
    });

    // Update article via UI.
    const updatedTitle = `Updated ${article.data.title}`;
    const updatedBody = `Updated body content ${Date.now()}`;
    await editorPage.updateTitle(updatedTitle);
    await editorPage.updateBody(updatedBody);
    await editorPage.publish();

    // Assert redirection.
    await expect(page).toHaveURL(/\/article\//, { timeout: 10000 });

    // Assert UI content.
    await articlePage.expectTitle(updatedTitle);

    // Publishing gives the article a new slug. Point cleanup at the new slug
    // so the fixture deletes the article once, without a guaranteed 404.
    const pathParts = new URL(page.url()).pathname.split("/article/");
    article.slug = pathParts[pathParts.length - 1];

    // No UI login rotated the token, so the registration token is still valid.
    const apiArticle = await api.getArticle(article.slug, user.token);
    expect(apiArticle.title).toBe(updatedTitle);
    expect(apiArticle.body).toBe(updatedBody);
  });
});
