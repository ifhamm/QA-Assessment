import { test, expect } from "@playwright/test";
import { LoginPage } from "../../pages/login.page";
import { NavBar } from "../../pages/navbar.component";
import { ConduitAPI } from "../../api/conduit-api";
import { syntheticUser } from "../test-data";

test("article editor matches visual baseline", async ({ page, request }) => {
    const api = new ConduitAPI(request);
    const loginPage = new LoginPage(page);
    const navBar = new NavBar(page);

    const user = syntheticUser();

    await api.registerUser(
        user.username,
        user.email,
        user.password
    );

    await loginPage.goto();
    await loginPage.login(user.email, user.password);

    await navBar.expectLoggedIn(user.username);

    await page.goto("/editor");

    await expect(
        page.getByPlaceholder("Article Title")
    ).toBeVisible();

    await expect(
        page.getByPlaceholder("What's this article about?")
    ).toBeVisible();

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