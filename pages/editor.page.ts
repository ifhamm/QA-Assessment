import { type Page, type Locator, expect } from "@playwright/test";

export class EditorPage {
  readonly page: Page;
  readonly titleInput: Locator;
  readonly descriptionInput: Locator;
  readonly bodyInput: Locator;
  readonly tagsInput: Locator;
  readonly publishButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.titleInput = page.getByPlaceholder("Article Title");
    this.descriptionInput = page.getByPlaceholder("What's this article about?");
    this.bodyInput = page.getByPlaceholder("Write your article (in markdown)");
    this.tagsInput = page.getByPlaceholder("Enter tags");
    this.publishButton = page.getByRole("button", { name: "Publish Article" });
  }

  async goto(slug?: string) {
    if (slug) {
      await this.page.goto(`/editor/${slug}`);
    } else {
      await this.page.goto("/editor");
    }
  }

  async fillArticle(data: {
    title: string;
    description: string;
    body: string;
    tagList?: string[];
  }) {
    await this.titleInput.fill(data.title);
    await this.descriptionInput.fill(data.description);
    await this.bodyInput.fill(data.body);
    if (data.tagList) {
      for (const tag of data.tagList) {
        await this.tagsInput.fill(tag);
        await this.tagsInput.press("Enter");
      }
    }
  }

  async publish() {
    await this.publishButton.click();
  }

  async updateTitle(newTitle: string) {
    await this.titleInput.fill(newTitle);
  }

  async updateBody(newBody: string) {
    await this.bodyInput.fill(newBody);
  }
}
