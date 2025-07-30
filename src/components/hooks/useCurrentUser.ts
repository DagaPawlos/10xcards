import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial user state from server
    const checkUserSession = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch {
        // Silent error handling
      } finally {
        setLoading(false);
      }
    };

    checkUserSession();
  }, []);

  return { user, loading };
}
