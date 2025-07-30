import { useEffect, useState, type ChangeEvent } from "react";

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
  const validationColorClass = textLength === 0 ? "text-gray-500" : isValid ? "text-green-600" : "text-red-600";

  return (
    <div className="border rounded-lg shadow-sm">
      <div className="p-6">
        <textarea
          placeholder="Paste your text here (1,000 - 10,000 characters)"
          value={value}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full min-h-[200px] p-3 border rounded-md resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>
      <div className="flex justify-between items-center p-6 pt-0">
        <span className={validationColorClass}>{validationMessage || `Characters: ${textLength}`}</span>
        <span className={`text-sm ${validationColorClass}`}>{textLength}/10000</span>
      </div>
    </div>
  );
}
