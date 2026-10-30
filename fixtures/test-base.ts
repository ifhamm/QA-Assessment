import { test as base, expect, type Page } from "@playwright/test";
import {
  ConduitAPI,
  type Article,
  type ArticleData,
  type AuthUser,
} from "../api/conduit-api";
import { ArticlePage } from "../pages/article.page";
import { EditorPage } from "../pages/editor.page";
import { LoginPage } from "../pages/login.page";
import { NavBar } from "../pages/navbar.component";
import { JWT_STORAGE_KEY } from "../tests/auth-storage";
import { syntheticArticle } from "../tests/test-data";

export type TestUser = AuthUser & {
  password: string;
};

/**
 * One API-created article per test.
 *
 * The `slug` is mutable because updating an article through the UI gives it a
 * new slug. A test can point cleanup at the new slug by assigning to it.
 */
export type TestArticle = {
  data: ArticleData;
  created: Article;
  slug: string;
};

type Fixtures = {
  api: ConduitAPI;
  loginPage: LoginPage;
  editorPage: EditorPage;
  articlePage: ArticlePage;
  navBar: NavBar;
  user: TestUser;
  authenticatedPage: Page;
  article: TestArticle;
};

export const test = base.extend<Fixtures>({
  api: async ({ request }, use) => {
    await use(new ConduitAPI(request));
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  editorPage: async ({ page }, use) => {
    await use(new EditorPage(page));
  },
  articlePage: async ({ page }, use) => {
    await use(new ArticlePage(page));
  },
  navBar: async ({ page }, use) => {
    await use(new NavBar(page));
  },
  user: async ({ api }, use) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const password = `Password_${id}!`;
    const user = await api.registerUser(
      `testuser_${id}`,
      `testuser_${id}@example.com`,
      password
    );
    const userData = { ...user, password };

    await use(userData);
    await api.deleteUser(userData.token);
  },
  /**
   * The configured page with the test user's JWT already in localStorage.
   *
   * The app reads the token before its own scripts run, so tests that are not
   * about the login flow do not need to submit the login form. This is
   * per-test because each test owns its own user; the shared setup user would
   * be the wrong identity for data-owning tests.
   */
  authenticatedPage: async ({ page, user }, use) => {
    await page.addInitScript(
      ({ key, token }) => {
        try {
          window.localStorage.setItem(key, token);
        } catch {
          // about:blank and other non-origin pages have no usable localStorage.
        }
      },
      { key: JWT_STORAGE_KEY, token: user.token }
    );

    await use(page);
  },
  /**
   * Creates the article before the test and deletes it afterwards.
   * Playwright runs this teardown even when the test fails, which is why the
   * cleanup no longer needs a `try/finally` block in the test body.
   */
  article: async ({ api, user }, use) => {
    const data = syntheticArticle("Fixture");
    const created = await api.createArticle(user.token, data);
    const article: TestArticle = { data, created, slug: created.slug };

    await use(article);

    // The public API replaces the user's token on every login. If the test
    // logged in through the UI, `user.token` is stale here, so log in again
    // to get a token that can delete the article.
    const cleanupUser = await api.login(user.email, user.password);
    await api.deleteArticle(cleanupUser.token, article.slug);
  },
});

export { expect };
