import { type Page, type Locator, expect } from "@playwright/test";

export class ArticlePage {
  readonly page: Page;
  readonly title: Locator;
  readonly body: Locator;
  readonly editButton: Locator;
  readonly deleteButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.getByRole("heading", { level: 1 });
    this.body = page.locator(".article-content");
    this.editButton = page.getByRole("link", { name: /Edit Article/i });
    this.deleteButton = page.getByRole("button", { name: /Delete Article/i });
  }

  async expectTitle(expectedTitle: string) {
    await expect(this.title).toHaveText(expectedTitle, { timeout: 10000 });
  }

  async expectBodyContains(text: string) {
    await expect(this.body).toContainText(text, { timeout: 10000 });
  }
}
