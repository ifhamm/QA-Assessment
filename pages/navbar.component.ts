import { type Page, expect } from "@playwright/test";

/**
 * Lightweight navbar helper — not a full Page Object,
 * just shared assertions for navigation state.
 */
export class NavBar {
  constructor(private readonly page: Page) {}

  async expectLoggedIn(username: string) {
    await expect(
      this.page.getByRole("link", { name: "New Article" })
    ).toBeVisible();
    await expect(
      this.page.getByRole("link", { name: username })
    ).toBeVisible();
  }

  async expectLoggedOut() {
    await expect(
      this.page.getByRole("link", { name: "Sign in" })
    ).toBeVisible();
    await expect(
      this.page.getByRole("link", { name: "Sign up" })
    ).toBeVisible();
  }
}
