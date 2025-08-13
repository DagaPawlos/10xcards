/**
 * Configuration for E2E tests with cloud Supabase database
 *
 * This file contains test user credentials and configuration
 * that should be used across all E2E tests for consistency.
 */

// Test user credentials from .env.test
export const E2E_CONFIG = {
  testUser: {
    id: process.env.E2E_USERNAME_ID || "",
    email: process.env.E2E_USERNAME || "",
    password: process.env.E2E_PASSWORD || "",
  },

  // Base URLs
  baseURL: "http://127.0.0.1:4321",

  // Common test data
  sampleFlashcard: {
    question: "What is React?",
    answer: "A JavaScript library for building user interfaces",
  },

  // Test timeouts
  timeouts: {
    login: 5000,
    navigation: 3000,
    apiRequest: 10000,
  },
};

/**
 * Helper function to validate E2E configuration
 */
export function validateE2EConfig() {
  const missing = [];

  if (!E2E_CONFIG.testUser.email) missing.push("E2E_USERNAME");
  if (!E2E_CONFIG.testUser.password) missing.push("E2E_PASSWORD");
  if (!E2E_CONFIG.testUser.id) missing.push("E2E_USERNAME_ID");

  if (missing.length > 0) {
    throw new Error(
      `Missing required E2E environment variables: ${missing.join(", ")}.\n` + `Please add them to your .env.test file.`
    );
  }
}
