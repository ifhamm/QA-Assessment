import { test, expect } from "../../fixtures/test-base";

test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Cross-Layer Tests", () => {
  // ─── Test 1: API create → UI verify ─────────────────────────────────
  test("article created via API is visible in the UI", async ({
    page,
    user,
    loginPage,
    articlePage,
    navBar,
    article,
  }) => {
    // The user and the article are prepared by fixtures before this line.
    // Signing in through the UI is still part of the scenario.
    await loginPage.goto();
    await loginPage.login(user.email, user.password);
    await navBar.expectLoggedIn(user.username);

    await page.goto(`/article/${article.created.slug}`);

    // Assert UI content.
    await articlePage.expectTitle(article.created.title);
    await articlePage.expectBodyContains(
      article.data.body.replace(/\*\*/g, "")
    );
  });

  // ─── Test 2: UI update → API verify ─────────────────────────────────
  test("article updated via UI is reflected in the API", async ({
    page,
    api,
    user,
    loginPage,
    editorPage,
    articlePage,
    navBar,
    article,
  }) => {
    await loginPage.goto();
    await loginPage.login(user.email, user.password);
    await navBar.expectLoggedIn(user.username);

    // Navigate to article editor.
    await editorPage.goto(article.created.slug);

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

    // Assert API content.
    // The token from registration is stale after the UI login, so get a fresh one.
    const freshUser = await api.login(user.email, user.password);
    const apiArticle = await api.getArticle(article.slug, freshUser.token);
    expect(apiArticle.title).toBe(updatedTitle);
    expect(apiArticle.body).toBe(updatedBody);
  });
});
