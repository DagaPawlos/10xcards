import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, Pencil } from "lucide-react";
import type { FlashcardProposalViewModel } from "../FlashcardGenerationView";

interface FlashcardListItemProps {
  flashcard: FlashcardProposalViewModel;
  onAccept: (id: number) => void;
  onReject: (id: number) => void;
  onEdit: (id: number) => void;
}

export function FlashcardListItem({ flashcard, onAccept, onReject, onEdit }: FlashcardListItemProps) {
  const { id, front, back, accepted, edited } = flashcard;

  return (
    <Card className={accepted ? "border-green-500" : ""}>
      <CardHeader className="space-y-1 pb-3">
        <div className="flex items-start justify-between">
          <span className="text-sm font-medium">{edited ? "Edited" : "AI Generated"}</span>
          <div className="flex gap-2">
            <Button
              size="icon"
              variant={accepted ? "default" : "outline"}
              onClick={() => onAccept(id)}
              className={accepted ? "bg-green-500 hover:bg-green-600" : ""}
            >
              <Check className="h-4 w-4" />
              <span className="sr-only">Accept flashcard</span>
            </Button>
            <Button size="icon" variant="outline" onClick={() => onEdit(id)}>
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit flashcard</span>
            </Button>
            <Button
              size="icon"
              variant="outline"
              onClick={() => onReject(id)}
              className="hover:bg-destructive hover:text-destructive-foreground"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Reject flashcard</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="border-t pt-3">
        <div className="space-y-2">
          <div>
            <span className="text-sm font-medium">Front</span>
            <p className="mt-1">{front}</p>
          </div>
          <div>
            <span className="text-sm font-medium">Back</span>
            <p className="mt-1">{back}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <span className="text-xs text-muted-foreground">{accepted ? "Accepted" : "Not accepted yet"}</span>
      </CardFooter>
    </Card>
  );
}
