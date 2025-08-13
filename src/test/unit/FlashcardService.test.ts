import { describe, it, expect, vi, beforeEach } from "vitest";
import { FlashcardService } from "@/lib/services/flashcard.service";
import type { FlashcardCreateDto, FlashcardDto } from "@/types";
import type { SupabaseClient } from "@/db/supabase.client";

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(),
} as unknown as SupabaseClient;

// Mock data
const mockCreateDto: FlashcardCreateDto = {
  front: "Test question",
  back: "Test answer",
  source: "ai-full",
  generation_id: 123,
};

const mockFlashcardResponse: FlashcardDto = {
  id: 1,
  front: "Test question",
  back: "Test answer",
  source: "ai-full",
  generation_id: 123,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

const userId = "user-123";

describe("FlashcardService", () => {
  let flashcardService: FlashcardService;
  let mockChain: {
    select: ReturnType<typeof vi.fn>;
    insert: ReturnType<typeof vi.fn>;
    eq: ReturnType<typeof vi.fn>;
    in: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Create simplified mock chain
    mockChain = {
      select: vi.fn().mockResolvedValue({ data: [mockFlashcardResponse], error: null }),
      insert: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
    };

    // Chain the calls properly
    mockChain.insert.mockReturnValue({ select: mockChain.select });
    mockChain.select.mockReturnValue({ in: mockChain.in });
    mockChain.in.mockReturnValue({ eq: mockChain.eq });
    mockChain.eq.mockResolvedValue({ data: [{ id: 123 }], error: null });

    (mockSupabase.from as ReturnType<typeof vi.fn>).mockReturnValue(mockChain);
    flashcardService = new FlashcardService(mockSupabase, userId);
  });

  describe("createFlashcards", () => {
    it("creates flashcards successfully with user_id added", async () => {
      // Arrange - setup full chain mock
      const mockResolvedData = {
        data: [mockFlashcardResponse],
        error: null,
      };

      mockChain.select.mockResolvedValue(mockResolvedData);

      // Act
      const result = await flashcardService.createFlashcards([mockCreateDto]);

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith("flashcards");
      expect(mockChain.insert).toHaveBeenCalledWith([
        {
          ...mockCreateDto,
          user_id: userId,
        },
      ]);
      expect(result).toEqual([mockFlashcardResponse]);
    });

    it("throws error when database operation fails", async () => {
      // Arrange
      const mockErrorData = {
        data: null,
        error: { message: "Database error" },
      };

      mockChain.select.mockResolvedValue(mockErrorData);

      // Act & Assert
      await expect(flashcardService.createFlashcards([mockCreateDto])).rejects.toThrow("Failed to create flashcards");
    });
  });

  describe("validateGenerationIds", () => {
    it("validates generation IDs successfully for user", async () => {
      // Arrange
      const mockResolvedData = {
        data: [{ id: 123 }],
        error: null,
      };

      mockChain.eq.mockResolvedValue(mockResolvedData);

      // Act
      await flashcardService.validateGenerationIds([123]);

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith("generations");
      expect(mockChain.select).toHaveBeenCalledWith("id");
      expect(mockChain.in).toHaveBeenCalledWith("id", [123]);
      expect(mockChain.eq).toHaveBeenCalledWith("user_id", userId);
    });

    it("skips validation when no generation IDs provided", async () => {
      // Act
      await flashcardService.validateGenerationIds([]);

      // Assert
      expect(mockSupabase.from).not.toHaveBeenCalled();
    });
  });
});
