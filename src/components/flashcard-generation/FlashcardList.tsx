import type { FlashcardProposalViewModel } from "./../FlashcardGenerationView";
import { FlashcardListItem } from "./FlashcardListItem";

interface FlashcardListProps {
  flashcards: FlashcardProposalViewModel[];
  onAccept: (id: number) => void;
  onReject: (id: number) => void;
  onEdit: (id: number) => void;
}

export function FlashcardList({ flashcards, onAccept, onReject, onEdit }: FlashcardListProps) {
  return (
    <div className="space-y-4">
      {flashcards.map((flashcard) => (
        <FlashcardListItem
          key={flashcard.id}
          flashcard={flashcard}
          onAccept={onAccept}
          onReject={onReject}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}
