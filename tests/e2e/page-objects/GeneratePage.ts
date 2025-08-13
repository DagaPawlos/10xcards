import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { E2E_CONFIG } from "../../fixtures/e2e-config";

/**
 * Page Object Model for Generate Flashcards page
 * Encapsulates flashcard generation functionality
 */
export class GeneratePage {
  constructor(private page: Page) {}

  // Locators
  get heading() {
    return this.page.getByRole("heading", { name: /generate/i });
  }

  get textInput() {
    return this.page.getByLabel(/text/i);
  }

  get generateButton() {
    return this.page.getByRole("button", { name: /generate/i });
  }

  get saveButton() {
    return this.page.getByRole("button", { name: /save/i });
  }

  get flashcardsList() {
    return this.page.getByTestId("flashcards-list");
  }

  get flashcardItems() {
    return this.page.getByTestId("flashcard");
  }

  get loadingSpinner() {
    return this.page.getByTestId("loading");
  }

  get errorMessage() {
    return this.page.getByTestId("error-message");
  }

  get successMessage() {
    return this.page.getByText(/saved/i);
  }

  // Actions
  async navigate() {
    await this.page.goto("/generate");
    await expect(this.heading).toBeVisible();
  }

  async fillTextInput(text: string) {
    await this.textInput.fill(text);
  }

  async clickGenerate() {
    await this.generateButton.click();
  }

  async generateFlashcards(text: string) {
    await this.fillTextInput(text);
    await this.clickGenerate();
  }

  async generateSampleFlashcards() {
    const sampleText = `
      React is a popular JavaScript library for building user interfaces.
      It was developed by Facebook and is widely used for creating web applications.
      React uses a component-based architecture and virtual DOM for efficient rendering.
    `;
    await this.generateFlashcards(sampleText);
  }

  async waitForGeneration() {
    // Wait for loading to appear and disappear
    await expect(this.loadingSpinner).toBeVisible();
    await expect(this.loadingSpinner).toBeHidden({ timeout: E2E_CONFIG.timeouts.apiRequest });
  }

  async saveFlashcards() {
    await this.saveButton.click();
    await expect(this.successMessage).toBeVisible({ timeout: E2E_CONFIG.timeouts.apiRequest });
  }

  async getFlashcardCount() {
    return await this.flashcardItems.count();
  }

  async getFlashcardText(index: number) {
    const flashcard = this.flashcardItems.nth(index);
    const question = await flashcard.getByTestId("question").textContent();
    const answer = await flashcard.getByTestId("answer").textContent();
    return { question, answer };
  }

  // Assertions
  async expectToBeLoaded() {
    await expect(this.heading).toBeVisible();
    await expect(this.textInput).toBeVisible();
    await expect(this.generateButton).toBeVisible();
  }

  async expectFlashcardsGenerated() {
    await expect(this.flashcardsList).toBeVisible();
    await expect(this.flashcardItems.first()).toBeVisible();
  }

  async expectGenerationError() {
    await expect(this.errorMessage).toBeVisible();
  }

  async expectFlashcardsSaved() {
    await expect(this.successMessage).toBeVisible();
  }

  async expectMinimumFlashcards(count: number) {
    const actualCount = await this.getFlashcardCount();
    expect(actualCount).toBeGreaterThanOrEqual(count);
  }
}
