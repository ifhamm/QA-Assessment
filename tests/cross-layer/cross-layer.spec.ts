import { test, expect } from "../../fixtures/test-base";
import { uniqueId } from "../test-data";

test.use({ storageState: { cookies: [], origins: [] } });

test.describe("Cross-Layer Tests", () => {
  test("article created via API is visible in the UI @smoke", async ({
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

    await articlePage.expectTitle(article.created.title);
    await articlePage.expectBodyContains(
      article.data.body.replace(/\*\*/g, "")
    );
  });

  test("article updated via UI is reflected in the API @regression", async ({
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

    await expect(editorPage.titleInput).toHaveValue(article.data.title);

    const updatedTitle = `Updated ${article.data.title}`;
    const updatedBody = `Updated body content ${uniqueId(test.info().workerIndex)}`;
    await editorPage.updateTitle(updatedTitle);
    await editorPage.updateBody(updatedBody);
    await editorPage.publish();

    await expect(page).toHaveURL(/\/article\//);

    // Publishing gives the article a new slug. Point cleanup at the new slug
    // before UI assertions so a failure still cleans up the updated article.
    const pathParts = new URL(page.url()).pathname.split("/article/");
    article.slug = pathParts[pathParts.length - 1];

    await articlePage.expectTitle(updatedTitle);

    // No UI login rotated the token, so the registration token is still valid.
    const apiArticle = await api.getArticle(article.slug, user.token);
    expect(apiArticle.title).toBe(updatedTitle);
    expect(apiArticle.body).toBe(updatedBody);
  });
});
