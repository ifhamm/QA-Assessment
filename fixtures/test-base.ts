import { test as base, expect } from "@playwright/test";
import { EditorPage } from "../pages/editor.page";
import { LoginPage } from "../pages/login.page";

type PageFixtures = {
  loginPage: LoginPage;
  editorPage: EditorPage;
};

export const test = base.extend<PageFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  editorPage: async ({ page }, use) => {
    await use(new EditorPage(page));
  },
});

export { expect };
