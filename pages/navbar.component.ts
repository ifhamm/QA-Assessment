import { type Locator, type Page, expect } from "@playwright/test";

/**
 * Lightweight navbar helper — not a full Page Object,
 * just shared assertions for navigation state.
 *
 * Every query is scoped to the navigation landmark. An unscoped role query
 * for a username also matches article author links, which Playwright rejects
 * in strict mode as soon as an article page is open.
 */
export class NavBar {
  private readonly nav: Locator;

  constructor(page: Page) {
    this.nav = page.getByRole("navigation");
  }

  newArticleLink(): Locator {
    // The accessible name starts with the editor icon.
    return this.nav.getByRole("link", { name: /New Article/ });
  }

  usernameLink(username: string): Locator {
    return this.nav.getByRole("link", { name: username, exact: true });
  }

  signInLink(): Locator {
    return this.nav.getByRole("link", { name: "Sign in", exact: true });
  }

  signUpLink(): Locator {
    return this.nav.getByRole("link", { name: "Sign up", exact: true });
  }

  async expectLoggedIn(username: string) {
    await expect(this.newArticleLink()).toBeVisible();
    await expect(this.usernameLink(username)).toBeVisible();
  }

  async expectLoggedOut() {
    await expect(this.signInLink()).toBeVisible();
    await expect(this.signUpLink()).toBeVisible();
  }
}
