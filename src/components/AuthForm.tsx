import { useId } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Alert } from "./ui/alert";
import { useState } from "react";

export interface AuthFormProps {
  mode: "login" | "register";
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  success?: string;
  isLoading?: boolean;
}

export function AuthForm({
  mode,
  onSubmit,
  onChange,
  error: errorProp,
  success,
  isLoading: isLoadingProp,
}: AuthFormProps) {
  const emailId = useId();
  const passwordId = useId();
  const repeatPasswordId = useId();
  const isRegister = mode === "register";

  // Local state for login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  // Local state for registration
  const [repeatPassword, setRepeatPassword] = useState("");

  // Only handle login here
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    if (onSubmit) return onSubmit(e); // fallback to parent handler if provided
    e.preventDefault();
    setError(undefined);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        window.location.href = "/"; // SSR reload
      } else {
        const data = await res.json();
        setError(data.error || "Login failed");
      }
    } catch {
      setError("Unexpected error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Registration handler
  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    if (onSubmit) return onSubmit(e);
    e.preventDefault();
    setError(undefined);
    setLoading(true);
    if (password !== repeatPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        window.location.href = "/login";
      } else {
        const data = await res.json();
        setError(data.error || "Registration failed");
      }
    } catch {
      setError("Unexpected error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) onChange(e);
    if (e.target.name === "email") setEmail(e.target.value);
    if (e.target.name === "password") setPassword(e.target.value);
    if (e.target.name === "repeatPassword") setRepeatPassword(e.target.value);
  };

  return (
    <Card className="max-w-md mx-auto p-8">
      <form onSubmit={isRegister ? handleRegister : handleSubmit} className="space-y-6">
        <h2 className="text-2xl font-bold text-center mb-4">
          {isRegister ? "Create an account" : "Sign in to your account"}
        </h2>
        {(error || errorProp) && <Alert variant="destructive">{error || errorProp}</Alert>}
        {success && <Alert>{success}</Alert>}
        <div className="space-y-2">
          <Label htmlFor={emailId}>Email</Label>
          <Input
            id={emailId}
            name="email"
            type="email"
            autoComplete="email"
            required
            onChange={handleChange}
            disabled={loading || isLoadingProp}
            value={email}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={passwordId}>Password</Label>
          <Input
            id={passwordId}
            name="password"
            type="password"
            autoComplete={isRegister ? "new-password" : "current-password"}
            required
            onChange={handleChange}
            disabled={loading || isLoadingProp}
            value={password}
          />
        </div>
        {isRegister && (
          <div className="space-y-2">
            <Label htmlFor={repeatPasswordId}>Repeat password</Label>
            <Input
              id={repeatPasswordId}
              name="repeatPassword"
              type="password"
              autoComplete="new-password"
              required
              onChange={handleChange}
              disabled={isLoadingProp}
              value={repeatPassword}
            />
          </div>
        )}
        <Button type="submit" className="w-full" disabled={loading || isLoadingProp}>
          {loading || isLoadingProp
            ? isRegister
              ? "Registering..."
              : "Signing in..."
            : isRegister
              ? "Register"
              : "Sign in"}
        </Button>
        <div className="text-center mt-4 text-sm">
          {isRegister ? (
            <a href="/login" className="text-blue-600 hover:underline">
              Already have an account? Sign in
            </a>
          ) : (
            <a href="/register" className="text-blue-600 hover:underline">
              Don’t have an account? Register
            </a>
          )}
        </div>
      </form>
    </Card>
  );
}
