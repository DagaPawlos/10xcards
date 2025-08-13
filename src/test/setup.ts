import { afterEach, beforeAll, afterAll, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";

// Extend global types for MSW
declare global {
  // eslint-disable-next-line no-var
  var msw: { server: unknown };
}

// Setup MSW for API mocking
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";

// Example MSW handlers - customize based on your API endpoints
export const handlers = [
  // Mock auth endpoints
  http.post("/api/auth/login", () => {
    return HttpResponse.json({ user: { id: "1", email: "test@example.com" } });
  }),

  http.post("/api/auth/register", () => {
    return HttpResponse.json({ user: { id: "1", email: "test@example.com" } });
  }),

  http.get("/api/auth/me", () => {
    return HttpResponse.json({ user: { id: "1", email: "test@example.com" } });
  }),

  // Mock flashcard endpoints
  http.get("/api/flashcards", () => {
    return HttpResponse.json([{ id: "1", question: "Test question", answer: "Test answer" }]);
  }),

  http.post("/api/flashcards", () => {
    return HttpResponse.json({ id: "1", question: "Test question", answer: "Test answer" });
  }),

  // Mock individual flashcard endpoints for CRUD operations
  http.put("/api/flashcards/:id", () => {
    return HttpResponse.json({ id: "1", front: "Updated question", back: "Test answer" });
  }),

  http.delete("/api/flashcards/:id", () => {
    return HttpResponse.json({ message: "Flashcard deleted successfully" });
  }),
];

const server = setupServer(...handlers);

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

// Close server after all tests
afterAll(() => server.close());

// Reset handlers after each test `important for test isolation`
afterEach(() => {
  server.resetHandlers();
  cleanup();
});

// Make server available globally for test-specific mocking
globalThis.msw = { server };

// Mock Supabase client for tests
vi.mock("@/db/supabase.client", () => ({
  supabaseClient: {
    auth: {
      signUp: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signInWithPassword: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
}));

// Mock environment variables
Object.defineProperty(import.meta, "env", {
  value: {
    PUBLIC_SUPABASE_URL: "https://test.supabase.co",
    PUBLIC_SUPABASE_ANON_KEY: "test-anon-key",
    SUPABASE_SERVICE_ROLE_KEY: "test-service-role-key",
    OPENROUTER_API_KEY: "test-openrouter-key",
    DEV: true,
    PROD: false,
    MODE: "test",
  },
  writable: true,
});
