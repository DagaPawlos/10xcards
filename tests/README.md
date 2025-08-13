# Tests

This directory contains various types of tests for the 10xCards application.

## Structure

- `e2e/` - End-to-end tests using Playwright with cloud Supabase database
- `fixtures/` - Test fixtures and configuration files
- `unit/` - Unit tests (handled by Vitest)

## E2E Tests Setup

E2E tests use a dedicated cloud Supabase project for testing. This ensures:

- Consistent test environment
- Isolation from development data
- Reproducible test scenarios

### Prerequisites

1. **Cloud Supabase Project**: Create a dedicated project for testing
2. **Environment Variables**: Configure `.env.test` file with your test database credentials
3. **Test User**: Create a test user in Supabase Auth dashboard

### Configuration

Create a `.env.test` file with:

```env
# Cloud Supabase credentials
SUPABASE_URL=your_test_project_url
SUPABASE_PUBLIC_KEY=your_test_project_anon_key

# Test user credentials (create manually in Supabase dashboard)
E2E_USERNAME_ID=test_user_uuid
E2E_USERNAME=test@example.com
E2E_PASSWORD=secure_test_password
```

### Running E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI mode
npm run test:e2e:ui

# Run E2E tests in debug mode
npm run test:e2e:debug

# Run specific test file
npx playwright test auth-cloud.spec.ts
```

### Database Migration

Before running E2E tests, ensure your cloud database has the latest schema:

```bash
# Link to your test project
supabase link --project-ref YOUR_PROJECT_ID

# Apply migrations
supabase db push
```

## Test Data Management

### Automatic Cleanup (Teardown)

The test suite automatically cleans up test data after all tests complete through a global teardown process:

- **Global Teardown**: Runs once after all tests finish
- **Authentication**: Uses test user credentials to bypass RLS policies
- **Scope**: Removes all data created by the test user during the test session
- **Tables Cleaned**: `flashcards`, `generations`, `generation_error_logs`

### Manual Test Data Management

For individual tests that need specific data setup/cleanup, use the `TestDataManager` helper:

```typescript
import { TestDataManager } from "../fixtures/test-data-manager";

let testDataManager: TestDataManager;

test.beforeAll(async () => {
  testDataManager = new TestDataManager();
});

test("should work with test data", async ({ page }) => {
  // Create test data
  const flashcards = await testDataManager.createSampleFlashcards(3);

  // ... run test ...

  // Clean up specific data if needed
  await testDataManager.cleanupFlashcards(flashcards.map((f) => f.id));
});
```

## Test Categories

### Authentication Tests (`auth-cloud.spec.ts`)

- User login/logout flows
- Session persistence
- Protected routes access

### Flashcard Tests (`flashcards-cloud.spec.ts`)

- Flashcard generation
- Saving/loading from database
- Error handling

## Best Practices

- Each test file should be independent
- Use the E2E_CONFIG helper for consistent configuration
- Clean up test data when necessary
- Use meaningful test descriptions
- Handle async operations with proper timeouts
