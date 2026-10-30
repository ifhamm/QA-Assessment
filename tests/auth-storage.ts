/**
 * The Conduit web app stores the JWT in localStorage under this key.
 *
 * This is the only browser state the app needs for an authenticated session;
 * the saved storage state contains no cookies. Keeping the key in one place
 * means the setup project and the per-test auth fixture cannot drift apart.
 */
export const JWT_STORAGE_KEY = "jwtToken";

export type AuthStorageState = {
  cookies: [];
  origins: Array<{
    origin: string;
    localStorage: Array<{ name: string; value: string }>;
  }>;
};

/** Builds a Playwright storage state from an API token. */
export function buildStorageState(
  baseURL: string,
  token: string
): AuthStorageState {
  return {
    cookies: [],
    origins: [
      {
        origin: new URL(baseURL).origin,
        localStorage: [{ name: JWT_STORAGE_KEY, value: token }],
      },
    ],
  };
}
