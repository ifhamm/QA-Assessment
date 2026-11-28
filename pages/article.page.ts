import { type Page, type Locator, expect } from "@playwright/test";

export class ArticlePage {
  readonly page: Page;
  readonly title: Locator;
  readonly body: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.getByRole("heading", { level: 1 });
    this.body = page.locator(".article-content");
  }

  deleteButton(): Locator {
    // The article page renders the destructive action twice (top and bottom meta sections).
    return this.page.getByRole("button", { name: /Delete Article/i }).first();
  }

  async delete() {
    await this.deleteButton().click();
  }

  async expectTitle(expectedTitle: string) {
    await expect(this.title).toHaveText(expectedTitle, { timeout: 10000 });
  }

  async expectBodyContains(text: string) {
    await expect(this.body).toContainText(text, { timeout: 10000 });
  }
}
