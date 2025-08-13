import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { E2E_CONFIG } from "../../fixtures/e2e-config";

/**
 * Page Object Model for Login page
 * Encapsulates login page elements and interactions
 */
export class LoginPage {
  constructor(private page: Page) {}

  // Locators
  get emailInput() {
    return this.page.getByLabel(/email/i);
  }

  get passwordInput() {
    return this.page.getByLabel(/password/i);
  }

  get signInButton() {
    return this.page.getByRole("button", { name: /sign in/i });
  }

  get signUpLink() {
    return this.page.getByText(/don't have an account/i);
  }

  get heading() {
    return this.page.getByRole("heading", { name: /sign in to your account/i });
  }

  // Actions
  async navigate() {
    await this.page.goto("/login");
    await expect(this.heading).toBeVisible();
  }

  async fillCredentials(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
  }

  async fillTestUserCredentials() {
    await this.fillCredentials(E2E_CONFIG.testUser.email, E2E_CONFIG.testUser.password);
  }

  async submitLogin() {
    await this.signInButton.click();
  }

  async loginWithCredentials(email: string, password: string) {
    await this.fillCredentials(email, password);
    await this.submitLogin();
  }

  async loginAsTestUser() {
    await this.fillTestUserCredentials();
    await this.submitLogin();
  }

  async navigateToSignUp() {
    await this.signUpLink.click();
    await expect(this.page).toHaveURL("/register");
  }

  // Assertions
  async expectToBeLoaded() {
    await expect(this.heading).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.signInButton).toBeVisible();
  }

  async expectLoginError() {
    // Look for error message (adjust selector based on your error handling)
    await expect(this.page.getByText(/error|invalid|wrong/i)).toBeVisible({
      timeout: E2E_CONFIG.timeouts.navigation,
    });
  }
}
