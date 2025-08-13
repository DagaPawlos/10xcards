import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SavedFlashcardsList } from "@/components/SavedFlashcardsList";
import type { FlashcardDto } from "@/types";

// Create our own fetch mock that will override MSW
const mockFetch = vi.fn();

// Mock window.confirm
const mockConfirm = vi.fn();
vi.stubGlobal("confirm", mockConfirm);

// Test data fixtures
const mockFlashcard: FlashcardDto = {
  id: 1,
  front: "Test question",
  back: "Test answer",
  source: "ai-full",
  generation_id: 123,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

describe("SavedFlashcardsList", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    // Override global fetch with our mock - this should take precedence over MSW
    vi.stubGlobal("fetch", mockFetch);
  });

  describe("Rendering", () => {
    it("shows empty state when no flashcards provided", () => {
      // Arrange & Act
      render(<SavedFlashcardsList initialFlashcards={[]} />);

      // Assert
      expect(screen.getByText("You have no saved flashcards yet.")).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /generate your first flashcards/i })).toHaveAttribute(
        "href",
        "/generate"
      );
    });

    it("renders flashcards list with content and source labels", () => {
      // Arrange & Act
      render(<SavedFlashcardsList initialFlashcards={[mockFlashcard]} />);

      // Assert
      expect(screen.getByText("Test question")).toBeInTheDocument();
      expect(screen.getByText("Test answer")).toBeInTheDocument();
      expect(screen.getByText("AI Generated")).toBeInTheDocument();
      expect(screen.getAllByRole("button")).toHaveLength(2); // Edit + Delete buttons
    });
  });

  describe("Edit functionality", () => {
    it("enters edit mode and updates flashcard successfully", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      render(<SavedFlashcardsList initialFlashcards={[mockFlashcard]} />);
      const editButtons = screen.getAllByRole("button");

      // Act - Enter edit mode
      await user.click(editButtons[0]);

      // Assert edit mode
      expect(screen.getByText("Edit Flashcard")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Test question")).toBeInTheDocument();

      // Act - Update and save
      const frontTextarea = screen.getByDisplayValue("Test question");
      await user.clear(frontTextarea);
      await user.type(frontTextarea, "Updated question");
      await user.click(screen.getByRole("button", { name: /save/i }));

      // Assert API call and UI update
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith("/api/flashcards/1", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            front: "Updated question",
            back: "Test answer",
          }),
        });
      });

      await waitFor(() => {
        expect(screen.queryByText("Edit Flashcard")).not.toBeInTheDocument();
      });
      expect(screen.getByText("Updated question")).toBeInTheDocument();
    });

    it("handles edit API errors", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: "Failed to update flashcard" }),
      });

      render(<SavedFlashcardsList initialFlashcards={[mockFlashcard]} />);
      await user.click(screen.getAllByRole("button")[0]);

      // Act
      await user.click(screen.getByRole("button", { name: /save/i }));

      // Assert
      await waitFor(() => {
        expect(screen.getByText("Failed to update flashcard")).toBeInTheDocument();
      });
      expect(screen.getByText("Edit Flashcard")).toBeInTheDocument(); // Modal should remain open
    });
  });

  describe("Delete functionality", () => {
    it("deletes flashcard successfully with confirmation", async () => {
      // Arrange
      mockConfirm.mockReturnValue(true);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      render(<SavedFlashcardsList initialFlashcards={[mockFlashcard]} />);
      const deleteButton = screen.getAllByRole("button")[1]; // Second button is delete

      // Act
      await user.click(deleteButton);

      // Assert
      expect(mockConfirm).toHaveBeenCalledWith("Are you sure you want to delete this flashcard?");
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith("/api/flashcards/1", {
          method: "DELETE",
        });
      });
      await waitFor(() => {
        expect(screen.queryByText("Test question")).not.toBeInTheDocument();
      });
    });

    it("does not delete when user cancels confirmation", async () => {
      // Arrange
      mockConfirm.mockReturnValue(false);
      render(<SavedFlashcardsList initialFlashcards={[mockFlashcard]} />);

      // Act
      await user.click(screen.getAllByRole("button")[1]);

      // Assert
      expect(mockFetch).not.toHaveBeenCalled();
      expect(screen.getByText("Test question")).toBeInTheDocument();
    });

    it("handles delete API errors", async () => {
      // Arrange
      mockConfirm.mockReturnValue(true);
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: "Failed to delete flashcard" }),
      });

      render(<SavedFlashcardsList initialFlashcards={[mockFlashcard]} />);

      // Act
      await user.click(screen.getAllByRole("button")[1]);

      // Assert
      await waitFor(() => {
        expect(screen.getByText("Failed to delete flashcard")).toBeInTheDocument();
      });
      expect(screen.getByText("Test question")).toBeInTheDocument(); // Card should remain
    });
  });
});
