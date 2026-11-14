import { type Page, type Locator } from "@playwright/test";

export class SettingsPage {
  readonly page: Page;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    // The link is rendered as a button, and its text includes the sentence
    // around it ("Or click here to logout.").
    this.logoutButton = page.getByRole("button", {
      name: /click here to logout/i,
    });
  }

  async goto() {
    await this.page.goto("/settings");
  }

  async logout() {
    await this.logoutButton.click();
  }
}
