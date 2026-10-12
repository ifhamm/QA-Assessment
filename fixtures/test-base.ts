import { test as base, expect } from "@playwright/test";
import { ConduitAPI, type AuthUser } from "../api/conduit-api";
import { EditorPage } from "../pages/editor.page";
import { LoginPage } from "../pages/login.page";

export type TestUser = AuthUser & {
  password: string;
};

type Fixtures = {
  api: ConduitAPI;
  loginPage: LoginPage;
  editorPage: EditorPage;
  user: TestUser;
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
});

export { expect };
