import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Pencil, Trash2, Save, X } from "lucide-react";
import type { FlashcardDto } from "../types";

interface SavedFlashcardsListProps {
  initialFlashcards: FlashcardDto[];
}

interface EditingFlashcard {
  id: number;
  front: string;
  back: string;
}

export function SavedFlashcardsList({ initialFlashcards }: SavedFlashcardsListProps) {
  const [flashcards, setFlashcards] = useState<FlashcardDto[]>(initialFlashcards);
  const [editingCard, setEditingCard] = useState<EditingFlashcard | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleEdit = (card: FlashcardDto) => {
    setEditingCard({
      id: card.id,
      front: card.front,
      back: card.back,
    });
  };

  const handleCancelEdit = () => {
    setEditingCard(null);
    setErrorMessage(null);
  };

  const handleSaveEdit = async () => {
    if (!editingCard) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/flashcards/${editingCard.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          front: editingCard.front,
          back: editingCard.back,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update flashcard");
      }

      // Update the flashcard in the local state
      setFlashcards((current) =>
        current.map((card) =>
          card.id === editingCard.id ? { ...card, front: editingCard.front, back: editingCard.back } : card
        )
      );

      setEditingCard(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this flashcard?")) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/flashcards/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete flashcard");
      }

      // Remove the flashcard from the local state
      setFlashcards((current) => current.filter((card) => card.id !== id));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (flashcards.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-4">You have no saved flashcards yet.</div>
        <a
          href="/generate"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Generate Your First Flashcards
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">{errorMessage}</div>
      )}

      <div className="grid gap-4">
        {flashcards.map((card) => (
          <Card key={card.id} className="p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {card.source === "ai-full" ? "AI Generated" : card.source === "ai-edited" ? "AI Edited" : "Manual"}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">{new Date(card.created_at).toLocaleDateString()}</span>
                <Button
                  onClick={() => handleEdit(card)}
                  disabled={isLoading}
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => handleDelete(card.id)}
                  disabled={isLoading}
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <div className="text-sm font-medium text-gray-600 mb-1">Question:</div>
                <div className="font-semibold text-lg">{card.front}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-600 mb-1">Answer:</div>
                <div className="text-gray-700">{card.back}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      {editingCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Edit Flashcard</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-front">Question</Label>
                <Textarea
                  id="edit-front"
                  value={editingCard.front}
                  onChange={(e) => setEditingCard((prev) => (prev ? { ...prev, front: e.target.value } : null))}
                  className="mt-1"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-back">Answer</Label>
                <Textarea
                  id="edit-back"
                  value={editingCard.back}
                  onChange={(e) => setEditingCard((prev) => (prev ? { ...prev, back: e.target.value } : null))}
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button onClick={handleCancelEdit} variant="outline" disabled={isLoading}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
