import { useId } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Alert } from "./ui/alert";

export interface PasswordResetFormProps {
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  success?: string;
  isLoading?: boolean;
}

export function PasswordResetForm({ onSubmit, onChange, error, success, isLoading }: PasswordResetFormProps) {
  const emailId = useId();
  return (
    <Card className="max-w-md mx-auto p-8">
      <form onSubmit={onSubmit} className="space-y-6">
        <h2 className="text-2xl font-bold text-center mb-4">Reset your password</h2>
        {error && <Alert variant="destructive">{error}</Alert>}
        {success && <Alert>{success}</Alert>}
        <div className="space-y-2">
          <Label htmlFor={emailId}>Email</Label>
          <Input
            id={emailId}
            name="email"
            type="email"
            autoComplete="email"
            required
            onChange={onChange}
            disabled={isLoading}
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Sending..." : "Send reset link"}
        </Button>
      </form>
    </Card>
  );
}
