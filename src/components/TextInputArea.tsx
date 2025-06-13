import { useEffect, useState, type ChangeEvent } from "react";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardFooter } from "./ui/card";

interface TextInputAreaProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function TextInputArea({ value, onChange, disabled }: TextInputAreaProps) {
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const textLength = value.length;

  useEffect(() => {
    if (textLength === 0) {
      setValidationMessage(null);
    } else if (textLength < 1000) {
      setValidationMessage(`Text is too short. Add ${1000 - textLength} more characters.`);
    } else if (textLength > 10000) {
      setValidationMessage(`Text is too long. Remove ${textLength - 10000} characters.`);
    } else {
      setValidationMessage(null);
    }
  }, [textLength]);

  const isValid = textLength >= 1000 && textLength <= 10000;
  const validationColor = textLength === 0 ? "text-muted-foreground" : isValid ? "text-green-600" : "text-destructive";

  return (
    <Card>
      <CardContent className="pt-6">
        <Textarea
          placeholder="Paste your text here (1,000 - 10,000 characters)"
          value={value}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
          disabled={disabled}
          className="min-h-[200px] resize-y"
        />
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <span className={validationColor}>{validationMessage || `Characters: ${textLength}`}</span>
        <span className={`text-sm ${validationColor}`}>{textLength}/10000</span>
      </CardFooter>
    </Card>
  );
}
