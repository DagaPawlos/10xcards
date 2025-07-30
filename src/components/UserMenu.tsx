import { useState } from "react";
import { Button } from "./ui/button";

interface UserMenuProps {
  userEmail: string;
}

export function UserMenu({ userEmail }: UserMenuProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (response.ok) {
        window.location.href = "/generate";
      }
    } catch {
      // Silent error handling
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Welcome, {userEmail}</span>
        <a href="/my-flashcards" className="text-blue-600 hover:underline text-sm">
          My Flashcards
        </a>
      </div>
      <Button onClick={handleLogout} disabled={isLoading} variant="outline" size="sm">
        {isLoading ? "Logging out..." : "Logout"}
      </Button>
    </div>
  );
}
