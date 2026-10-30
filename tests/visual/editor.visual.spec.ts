import { test, expect } from "../../fixtures/test-base";

test.use({ storageState: { cookies: [], origins: [] } });

test("article editor matches visual baseline", async ({
  authenticatedPage: page,
  user,
  editorPage,
  navBar,
}) => {
  await editorPage.goto();
  await navBar.expectLoggedIn(user.username);

  await expect(editorPage.titleInput).toBeVisible();
  await expect(editorPage.descriptionInput).toBeVisible();

  const usernameLink = page.getByRole("link", {
    name: user.username,
  });

  await usernameLink.evaluate((el) => {
    const element = el as HTMLElement;
    element.style.width = "120px";
    element.style.visibility = "hidden";
  });

  await expect(page).toHaveScreenshot("article-editor.png", {
    fullPage: true,
    mask: [usernameLink],
  });
});
