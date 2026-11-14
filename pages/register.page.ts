import { type Page, type Locator } from "@playwright/test";

export class RegisterPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly signUpButton: Locator;
  readonly errorMessages: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.getByPlaceholder("Username");
    this.emailInput = page.getByPlaceholder("Email");
    this.passwordInput = page.getByPlaceholder("Password");
    this.signUpButton = page.getByRole("button", { name: /Sign up/i });
    this.errorMessages = page.locator(".error-messages");
  }

  async goto() {
    await this.page.goto("/register");
  }
}
