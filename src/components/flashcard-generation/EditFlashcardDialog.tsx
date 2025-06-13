import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { FlashcardProposalViewModel } from "../FlashcardGenerationView";

interface EditFlashcardDialogProps {
  flashcard: FlashcardProposalViewModel | null;
  onClose: () => void;
  onSave: (id: number, front: string, back: string) => void;
}

export function EditFlashcardDialog({ flashcard, onClose, onSave }: EditFlashcardDialogProps) {
  const [front, setFront] = useState(flashcard?.front ?? "");
  const [back, setBack] = useState(flashcard?.back ?? "");
  const [errors, setErrors] = useState<{ front?: string; back?: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { front?: string; back?: string } = {};

    if (front.length === 0) {
      newErrors.front = "Front side cannot be empty";
    } else if (front.length > 200) {
      newErrors.front = "Front side cannot exceed 200 characters";
    }

    if (back.length === 0) {
      newErrors.back = "Back side cannot be empty";
    } else if (back.length > 500) {
      newErrors.back = "Back side cannot exceed 500 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm() && flashcard) {
      onSave(flashcard.id, front, back);
      onClose();
    }
  };

  if (!flashcard) return null;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Flashcard</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="front">
              Front Side <span className="text-sm text-muted-foreground">({front.length}/200)</span>
            </Label>
            <Textarea
              id="front"
              value={front}
              onChange={(e) => setFront(e.target.value)}
              className={errors.front ? "border-destructive" : ""}
            />
            {errors.front && <p className="text-sm text-destructive">{errors.front}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="back">
              Back Side <span className="text-sm text-muted-foreground">({back.length}/500)</span>
            </Label>
            <Textarea
              id="back"
              value={back}
              onChange={(e) => setBack(e.target.value)}
              className={errors.back ? "border-destructive" : ""}
            />
            {errors.back && <p className="text-sm text-destructive">{errors.back}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
