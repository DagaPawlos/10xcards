import { validateE2EConfig } from "./fixtures/e2e-config";

/**
 * Global setup for E2E tests
 * This runs once before all tests start
 */
export default function globalSetup() {
  // Load .env.test file for E2E tests
  // eslint-disable-next-line no-console
  console.log("🔧 Setting up E2E test environment...");

  // Validate that all required environment variables are present
  try {
    validateE2EConfig();
    // eslint-disable-next-line no-console
    console.log("✅ E2E configuration validated successfully");
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("❌ E2E configuration error:", (error as Error).message);
    process.exit(1);
  }

  // eslint-disable-next-line no-console
  console.log("🚀 E2E environment ready");
}
