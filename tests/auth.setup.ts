import { test as setup } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import { ConduitAPI, type AuthUser } from "../api/conduit-api";
import { buildStorageState } from "./auth-storage";
import { syntheticUser } from "./test-data";

const authFile = path.resolve("playwright/.auth/user.json");

setup("authenticate via API", async ({ request, baseURL }, testInfo) => {
  if (!baseURL) {
    throw new Error("BASE_URL must be set for the authentication setup.");
  }

  const api = new ConduitAPI(request);
  const email = process.env.AUTH_EMAIL;
  const password = process.env.AUTH_PASSWORD;
  let user: AuthUser | undefined;

  // AUTH_EMAIL/AUTH_PASSWORD are optional. When they are absent, skip the
  // login attempt and create a session-local user instead. The previous
  // version threw here, which made its own fallback unreachable.
  if (email && password) {
    try {
      user = await api.login(email, password);
    } catch (error) {
      if (
        !(error instanceof Error) ||
        !error.message.startsWith("Login failed: 401")
      ) {
        throw error;
      }
    }
  }

  if (!user) {
    const data = syntheticUser(testInfo.workerIndex);

    console.warn(
      email && password
        ? "Configured auth credentials are unavailable; creating a session-local setup user."
        : "AUTH_EMAIL/AUTH_PASSWORD are not set; creating a session-local setup user."
    );
    await api.registerUser(data.username, data.email, data.password);
    user = await api.login(data.email, data.password);
  }

  // The setup user is shared infrastructure for the dashboard, not per-test
  // data. The API has no user-deletion endpoint, so it cannot be cleaned up.
  // The app only needs the JWT in localStorage. Writing the state directly
  // avoids a UI login that was never part of what the setup project verifies.
  await fs.mkdir(path.dirname(authFile), { recursive: true });
  await fs.writeFile(
    authFile,
    JSON.stringify(buildStorageState(baseURL, user.token), null, 2)
  );
});
