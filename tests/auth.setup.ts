import { test as setup } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import { ConduitAPI } from "../api/conduit-api";

const authFile = path.resolve("playwright/.auth/user.json");

setup("authenticate via API", async ({ page, baseURL }) => {
  const email = process.env.AUTH_EMAIL;
  const password = process.env.AUTH_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "AUTH_EMAIL and AUTH_PASSWORD must be set for the authentication setup."
    );
  }
  if (!baseURL) {
    throw new Error("BASE_URL must be set for the authentication setup.");
  }

  const api = new ConduitAPI(page.request);
  let user;
  let loginPassword = password;
  try {
    user = await api.login(email, password);
  } catch (error) {
    if (!(error instanceof Error) || !error.message.startsWith("Login failed: 401")) {
      throw error;
    }

    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const fallbackEmail = `auth_${id}@example.com`;
    const fallbackPassword = `Password_${id}!`;
    const fallbackUsername = `auth_${id}`;

    console.warn(
      "Configured auth credentials are unavailable; creating a session-local setup user."
    );
    await api.registerUser(
      fallbackUsername,
      fallbackEmail,
      fallbackPassword
    );
    user = await api.login(fallbackEmail, fallbackPassword);
    loginPassword = fallbackPassword;
  }

  await page.goto(`${baseURL}/login`);
  await page.getByPlaceholder("Email").fill(user.email);
  await page.getByPlaceholder("Password").fill(loginPassword);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(`${baseURL}/`);

  await fs.mkdir(path.dirname(authFile), { recursive: true });
  await page.context().storageState({ path: authFile });
});
