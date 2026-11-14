import { test, expect } from "../../fixtures/test-base";
import { JWT_STORAGE_KEY } from "../auth-storage";

/**
 * WP8 negatives that only make sense in a browser.
 *
 * Server contracts (duplicate registration, malformed tokens) are covered at
 * the API level by the Newman collection, where the status code and error body
 * can be asserted directly. These tests cover behavior the API cannot show:
 * disabled form controls, inline validation messages, localStorage session
 * state, and the redirect that follows an invalid session.
 */
test.describe("Negative and boundary behavior", () => {
  test.describe("Registration form", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test("keeps Sign up disabled until every field is filled @regression", async ({
      page,
      registerPage,
    }) => {
      await registerPage.goto();
      await expect(registerPage.signUpButton).toBeDisabled();

      await registerPage.usernameInput.fill("candidate");
      await expect(registerPage.signUpButton).toBeDisabled();

      await registerPage.emailInput.fill("candidate@example.com");
      await expect(registerPage.signUpButton).toBeDisabled();

      await registerPage.passwordInput.fill("Password_123!");
      await expect(registerPage.signUpButton).toBeEnabled();
      await expect(page).toHaveURL(/\/register$/);
    });
  });

  test.describe("Invalid session", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test("treats an invalid stored token as logged out @regression", async ({
      page,
      navBar,
    }) => {
      // The token is syntactically wrong, but it still occupies the storage
      // key the app reads before bootstrapping.
      await page.addInitScript(
        (key) => window.localStorage.setItem(key, "not-a-valid-jwt"),
        JWT_STORAGE_KEY
      );

      await page.goto("/editor");

      await expect(page).toHaveURL(/\/login$/);
      await navBar.expectLoggedOut();
    });
  });

  test("rejects publishing an article with no content @regression", async ({
    authenticatedPage: page,
    editorPage,
  }) => {
    await editorPage.goto();

    // The publish control stays enabled, so the validation must come from the
    // submission round-trip and be shown inline.
    await editorPage.publish();

    await expect(page).toHaveURL(/\/editor$/);
    const errors = page.locator(".error-messages");
    await expect(errors).toContainText("title can't be blank");
    await expect(errors).toContainText("description can't be blank");
    await expect(errors).toContainText("body can't be blank");
  });

  test("logout clears the token and protects the editor @regression", async ({
    page,
    loginPage,
    navBar,
    settingsPage,
    user,
  }) => {
    // A UI login is required here: the authenticatedPage fixture re-injects
    // the token on every navigation, which would undo the logout under test.
    await loginPage.goto();
    await loginPage.login(user.email, user.password);
    await navBar.expectLoggedIn(user.username);

    await settingsPage.goto();
    await settingsPage.logout();

    await expect(page).toHaveURL(/\/$/);
    await navBar.expectLoggedOut();
    await expect
      .poll(() =>
        page.evaluate((key) => window.localStorage.getItem(key), JWT_STORAGE_KEY)
      )
      .toBeNull();

    await page.goto("/editor");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("deletes an owned article through the UI @regression", async ({
    authenticatedPage: page,
    article,
    request,
  }) => {
    await page.goto(`/article/${article.slug}`);

    // The article page renders the destructive action twice (top and bottom).
    const deleteButton = page
      .getByRole("button", { name: /Delete Article/i })
      .first();
    await expect(deleteButton).toBeVisible();
    await deleteButton.click();

    await expect(page).toHaveURL(/\/$/);

    // The UI redirect alone would also happen if the request never reached the
    // API, so confirm the article is gone at the source.
    const response = await request.get(`/api/articles/${article.slug}`);
    expect(response.status()).toBe(404);
  });
});
