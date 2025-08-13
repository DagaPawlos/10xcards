import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";

/**
 * Page Object Model for Homepage/Dashboard
 * Encapsulates main page elements and navigation
 */
export class HomePage {
  constructor(private page: Page) {}

  // Locators
  get welcomeMessage() {
    return this.page.getByText(/welcome/i);
  }

  get generateLink() {
    return this.page.getByRole("link", { name: /generate/i });
  }

  get myFlashcardsLink() {
    return this.page.getByRole("link", { name: /my flashcards/i });
  }

  get userMenu() {
    return this.page.getByTestId("user-menu");
  }

  get logoutButton() {
    return this.page.getByRole("button", { name: /logout|sign out/i });
  }

  // Actions
  async navigate() {
    await this.page.goto("/");
  }

  async navigateToGenerate() {
    await this.generateLink.click();
    await expect(this.page).toHaveURL("/generate");
  }

  async navigateToMyFlashcards() {
    await this.myFlashcardsLink.click();
    await expect(this.page).toHaveURL("/my-flashcards");
  }

  async logout() {
    await this.userMenu.click();
    await this.logoutButton.click();
    await expect(this.page).toHaveURL("/login");
  }

  // Assertions
  async expectToBeLoaded() {
    await expect(this.welcomeMessage).toBeVisible();
  }

  async expectUserToBeAuthenticated() {
    await expect(this.userMenu).toBeVisible();
    await expect(this.generateLink).toBeVisible();
    await expect(this.myFlashcardsLink).toBeVisible();
  }

  async expectUserToBeUnauthenticated() {
    await expect(this.page).toHaveURL("/login");
  }
}
