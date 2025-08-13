import { describe, it, expect, vi, beforeEach } from "vitest";
import { GenerationService } from "@/lib/services/generation.service";
import type { SupabaseClient } from "@/db/supabase.client";

// Mock OpenRouter service methods
const mockSetSystemMessage = vi.fn();
const mockSetUserMessage = vi.fn();
const mockGetChatCompletion = vi.fn();
const mockGetCurrentModelName = vi.fn().mockReturnValue("test-model");

vi.mock("@/lib/services/openrouter.service", () => ({
  OpenRouterService: vi.fn().mockImplementation(() => ({
    setSystemMessage: mockSetSystemMessage,
    setUserMessage: mockSetUserMessage,
    getChatCompletion: mockGetChatCompletion,
    getCurrentModelName: mockGetCurrentModelName,
  })),
}));

// Mock logger
const mockLoggerInfo = vi.fn();
const mockLoggerError = vi.fn();

vi.mock("@/lib/logger", () => ({
  Logger: vi.fn().mockImplementation(() => ({
    info: mockLoggerInfo,
    error: mockLoggerError,
  })),
}));

// Mock crypto.subtle for hash calculation
Object.defineProperty(global, "crypto", {
  value: {
    subtle: {
      digest: vi.fn().mockResolvedValue(new ArrayBuffer(32)),
    },
  },
});

// Mock Supabase client - simplified to only mock what's actually used
const mockSingle = vi.fn().mockResolvedValue({
  data: { id: 1 },
  error: null,
});

const mockSelect = vi.fn().mockReturnValue({
  single: mockSingle,
});

const mockInsert = vi.fn().mockReturnValue({
  select: mockSelect,
});

const mockFrom = vi.fn().mockReturnValue({
  insert: mockInsert,
});

const mockSupabaseClient = {
  from: mockFrom,
} as unknown as SupabaseClient;

describe("GenerationService", () => {
  let service: GenerationService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new GenerationService(mockSupabaseClient, "test-user-id", {
      apiKey: "test-api-key",
    });
  });

  describe("generateFlashcards", () => {
    it("generates flashcards from text input", async () => {
      // Arrange
      const inputText = "Paris is the capital of France. It has the Eiffel Tower.";
      const mockAIResponse = {
        flashcards: [
          { front: "What is the capital of France?", back: "Paris" },
          { front: "What famous tower is in Paris?", back: "Eiffel Tower" },
        ],
      };

      mockGetChatCompletion.mockResolvedValueOnce(mockAIResponse);

      // Act
      const result = await service.generateFlashcards(inputText);

      // Assert
      expect(result).toHaveProperty("generation_id");
      expect(result).toHaveProperty("flashcards_proposals");
      expect(result).toHaveProperty("generated_count");
      expect(result.flashcards_proposals).toHaveLength(2);
      expect(result.flashcards_proposals[0]).toEqual({
        front: "What is the capital of France?",
        back: "Paris",
        source: "ai-full",
      });
      expect(mockSetSystemMessage).toHaveBeenCalled();
      expect(mockSetUserMessage).toHaveBeenCalledWith(expect.stringContaining(inputText));
      expect(mockGetChatCompletion).toHaveBeenCalled();
    });

    it("handles AI service errors", async () => {
      // Arrange
      const inputText = "Test content";
      mockGetChatCompletion.mockRejectedValueOnce(new Error("AI service unavailable"));

      // Act & Assert
      await expect(service.generateFlashcards(inputText)).rejects.toThrow(
        "Failed to generate flashcards using AI service"
      );
    });

    it("creates generation record in database", async () => {
      // Arrange
      const inputText = "Test content";
      const mockAIResponse = {
        flashcards: [{ front: "Test question", back: "Test answer" }],
      };

      mockGetChatCompletion.mockResolvedValueOnce(mockAIResponse);

      // Act
      await service.generateFlashcards(inputText);

      // Assert
      expect(mockFrom).toHaveBeenCalledWith("generations");
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: "test-user-id",
          source_text_length: inputText.length,
          model: "test-model",
          generated_count: 1,
        })
      );
    });

    it("handles invalid AI response format", async () => {
      // Arrange
      const inputText = "Test content";
      mockGetChatCompletion.mockResolvedValueOnce({ invalid: "response" });

      // Act & Assert
      await expect(service.generateFlashcards(inputText)).rejects.toThrow(
        "Failed to generate flashcards using AI service"
      );
    });

    it("handles string AI response that can be parsed", async () => {
      // Arrange
      const inputText = "Test content";
      const mockStringResponse = JSON.stringify({
        flashcards: [{ front: "Q", back: "A" }],
      });

      mockGetChatCompletion.mockResolvedValueOnce(mockStringResponse);

      // Act
      const result = await service.generateFlashcards(inputText);

      // Assert
      expect(result.flashcards_proposals).toHaveLength(1);
      expect(result.flashcards_proposals[0]).toEqual({
        front: "Q",
        back: "A",
        source: "ai-full",
      });
    });

    it("handles unparseable string AI response", async () => {
      // Arrange
      const inputText = "Test content";
      mockGetChatCompletion.mockResolvedValueOnce("invalid json");

      // Act & Assert
      await expect(service.generateFlashcards(inputText)).rejects.toThrow(
        "Failed to generate flashcards using AI service"
      );
    });

    it("logs generation errors to database", async () => {
      // Arrange
      const inputText = "Test content";
      mockGetChatCompletion.mockRejectedValueOnce(new Error("Test error"));

      const mockErrorInsert = vi.fn().mockResolvedValue({ data: null, error: null });
      // Mock dla generation_error_logs table
      mockFrom.mockImplementationOnce((table) => {
        if (table === "generation_error_logs") {
          return { insert: mockErrorInsert };
        }
        return { insert: mockInsert };
      });

      // Act
      try {
        await service.generateFlashcards(inputText);
      } catch {
        // Expected to throw
      }

      // Assert
      expect(mockFrom).toHaveBeenCalledWith("generation_error_logs");
      expect(mockErrorInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          error_message: "Failed to generate flashcards using AI service",
          source_text_length: inputText.length,
        })
      );
    });
  });

  describe("constructor", () => {
    it("throws error when API key is missing", () => {
      // Act & Assert
      expect(() => {
        new GenerationService(mockSupabaseClient, "test-user", { apiKey: "" });
      }).toThrow("OpenRouter API key is required");
    });

    it("accepts null user ID for anonymous users", () => {
      // Act & Assert
      expect(() => {
        new GenerationService(mockSupabaseClient, null, { apiKey: "test-key" });
      }).not.toThrow();
    });
  });
});
