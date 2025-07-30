import { useId } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Alert } from "./ui/alert";

export interface SetNewPasswordFormProps {
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  success?: string;
  isLoading?: boolean;
}

export function SetNewPasswordForm({ onSubmit, onChange, error, success, isLoading }: SetNewPasswordFormProps) {
  const passwordId = useId();
  const repeatPasswordId = useId();
  return (
    <Card className="max-w-md mx-auto p-8">
      <form onSubmit={onSubmit} className="space-y-6">
        <h2 className="text-2xl font-bold text-center mb-4">Set a new password</h2>
        {error && <Alert variant="destructive">{error}</Alert>}
        {success && <Alert>{success}</Alert>}
        <div className="space-y-2">
          <Label htmlFor={passwordId}>New password</Label>
          <Input
            id={passwordId}
            name="password"
            type="password"
            autoComplete="new-password"
            required
            onChange={onChange}
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={repeatPasswordId}>Repeat new password</Label>
          <Input
            id={repeatPasswordId}
            name="repeatPassword"
            type="password"
            autoComplete="new-password"
            required
            onChange={onChange}
            disabled={isLoading}
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Saving..." : "Set new password"}
        </Button>
      </form>
    </Card>
  );
}
