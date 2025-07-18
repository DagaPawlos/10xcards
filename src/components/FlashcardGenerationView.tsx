"use client";

import { useState } from "react";
import { TextInputArea } from "./TextInputArea";
import { Button } from "./ui/button";
import { SkeletonLoader } from "./flashcard-generation/SkeletonLoader";
import { FlashcardList } from "./flashcard-generation/FlashcardList";
import { ErrorNotification } from "./flashcard-generation/ErrorNotification";
import { EditFlashcardDialog } from "./flashcard-generation/EditFlashcardDialog";
import { BulkSaveButton } from "./flashcard-generation/BulkSaveButton";
import type { GenerateFlashcardsCommand, FlashcardProposalDto } from "../types";

export interface FlashcardProposalViewModel extends FlashcardProposalDto {
  id: number;
  accepted: boolean;
  edited: boolean;
}

export function FlashcardGenerationView() {
  const [textValue, setTextValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [flashcardProposals, setFlashcardProposals] = useState<FlashcardProposalViewModel[]>([]);
  const [editingFlashcard, setEditingFlashcard] = useState<FlashcardProposalViewModel | null>(null);
  const [generationId, setGenerationId] = useState<number | null>(null);

  const handleTextChange = (value: string) => {
    setTextValue(value);
    setErrorMessage(null);
  };

  const handleAccept = (id: number) => {
    setFlashcardProposals((current) =>
      current.map((proposal) => (proposal.id === id ? { ...proposal, accepted: true } : proposal))
    );
  };

  const handleReject = (id: number) => {
    setFlashcardProposals((current) => current.filter((proposal) => proposal.id !== id));
  };

  const handleEdit = (id: number) => {
    const flashcard = flashcardProposals.find((f) => f.id === id);
    if (flashcard) {
      setEditingFlashcard(flashcard);
    }
  };

  const handleSaveEdit = (id: number, front: string, back: string) => {
    setFlashcardProposals((current) =>
      current.map((proposal) => (proposal.id === id ? { ...proposal, front, back, edited: true } : proposal))
    );
  };

  const handleSaveSuccess = () => {
    // Reset the state after successful save
    setFlashcardProposals([]);
    setGenerationId(null);
    setTextValue("");
  };

  const handleGenerateClick = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const command: GenerateFlashcardsCommand = {
        source_text: textValue,
      };

      const response = await fetch("/api/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to generate flashcards");
      }

      const result = await response.json();
      setGenerationId(result.generation_id);
      // Transform API response to view model with initial state
      const proposals: FlashcardProposalViewModel[] = result.flashcards_proposals.map(
        (proposal: FlashcardProposalDto, index: number) => ({
          ...proposal,
          id: index + 1,
          accepted: false,
          edited: false,
        })
      );
      setFlashcardProposals(proposals);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <TextInputArea value={textValue} onChange={handleTextChange} disabled={isLoading} />

      {errorMessage && <ErrorNotification message={errorMessage} />}

      <Button
        onClick={handleGenerateClick}
        disabled={isLoading || textValue.length < 1000 || textValue.length > 10000}
        className="w-full"
      >
        {isLoading ? "Generating..." : "Generate Flashcards"}
      </Button>

      {isLoading && <SkeletonLoader />}

      {!isLoading && flashcardProposals.length > 0 && (
        <>
          <FlashcardList
            flashcards={flashcardProposals}
            onAccept={handleAccept}
            onReject={handleReject}
            onEdit={handleEdit}
          />
          {generationId && (
            <BulkSaveButton
              flashcards={flashcardProposals}
              generationId={generationId}
              onSaveSuccess={handleSaveSuccess}
              onSaveError={setErrorMessage}
            />
          )}
        </>
      )}

      <EditFlashcardDialog
        flashcard={editingFlashcard}
        onClose={() => setEditingFlashcard(null)}
        onSave={handleSaveEdit}
      />
    </div>
  );
}
