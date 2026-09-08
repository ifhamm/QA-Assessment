/** Generates a unique identifier. */
export function uniqueId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Generates unique user credentials. */
export function syntheticUser() {
  const id = uniqueId();
  return {
    email: `testuser_${id}@example.com`,
    password: `Password_${id}!`,
    username: `testuser_${id}`,
  };
}

/** Generates unique article payload. */
export function syntheticArticle(prefix = "Test") {
  const id = uniqueId();
  return {
    title: `${prefix} Article ${id}`,
    description: `Description for test article ${id}`,
    body: `Body content of the test article ${id}. This is **markdown**.`,
    tagList: ["e2e", "test"],
  };
}
