import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import type { FlashcardProposalViewModel } from "../FlashcardGenerationView";
import type { FlashcardsCreateCommand, FlashcardCreateDto } from "../../types";

interface BulkSaveButtonProps {
  flashcards: FlashcardProposalViewModel[];
  generationId: number;
  onSaveSuccess: () => void;
  onSaveError: (error: string) => void;
}

export function BulkSaveButton({ flashcards, generationId, onSaveSuccess, onSaveError }: BulkSaveButtonProps) {
  const [isSaving, setIsSaving] = useState(false);

  const acceptedFlashcards = flashcards.filter((f) => f.accepted);
  const hasAcceptedFlashcards = acceptedFlashcards.length > 0;

  const transformToCreateDto = (flashcard: FlashcardProposalViewModel): FlashcardCreateDto => ({
    front: flashcard.front,
    back: flashcard.back,
    source: flashcard.edited ? "ai-edited" : "ai-full",
    generation_id: generationId,
  });

  const handleSaveAll = async () => {
    await saveFlashcards(flashcards);
  };

  const handleSaveAccepted = async () => {
    await saveFlashcards(acceptedFlashcards);
  };

  const saveFlashcards = async (cardsToSave: FlashcardProposalViewModel[]) => {
    try {
      setIsSaving(true);

      const command: FlashcardsCreateCommand = {
        flashcards: cardsToSave.map(transformToCreateDto),
      };

      const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save flashcards");
      }

      onSaveSuccess();
    } catch (error) {
      onSaveError(error instanceof Error ? error.message : "An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex gap-2 justify-end">
      <Button variant="outline" onClick={handleSaveAll} disabled={isSaving || flashcards.length === 0}>
        <Save className="h-4 w-4 mr-2" />
        Save All ({flashcards.length})
      </Button>
      {hasAcceptedFlashcards && (
        <Button onClick={handleSaveAccepted} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          Save Accepted ({acceptedFlashcards.length})
        </Button>
      )}
    </div>
  );
}
