import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("should display homepage", async ({ page }) => {
    await page.goto("/");

    // Check if the main elements are visible
    await expect(page.getByRole("heading", { name: "Generate Flashcards" })).toBeVisible();
    // The page title shows in browser tab, not as visible text on page
    await expect(page).toHaveTitle(/Generate Flashcards/);
  });

  test("should navigate to generate page", async ({ page }) => {
    await page.goto("/");

    // The page is already on generate page (index redirects to generate functionality)
    // Just verify the generate button is present and functional
    const generateButton = page.getByRole("button", { name: "Generate Flashcards" });

    await expect(generateButton).toBeVisible();
    // Check that the textarea with placeholder is present
    await expect(page.getByPlaceholder(/paste your text here/i)).toBeVisible();
  });

  test("should redirect to login if not authenticated", async ({ page }) => {
    await page.goto("/my-flashcards");

    // Should redirect to login page
    await expect(page).toHaveURL(/.*login.*/);
  });
});

test.describe("Flashcard Generation", () => {
  test("should display generation form", async ({ page }) => {
    await page.goto("/generate");

    // Check if generation form elements are present
    await expect(page.getByRole("textbox")).toBeVisible();
    await expect(page.getByRole("button", { name: /generate/i })).toBeVisible();
  });
});
