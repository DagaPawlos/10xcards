import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("utils", () => {
  describe("cn", () => {
    it("should merge class names correctly", () => {
      const result = cn("base-class", "additional-class");
      expect(result).toBe("base-class additional-class");
    });

    it("should handle conditional classes", () => {
      const isVisible = true;
      const isHidden = false;
      const result = cn("base-class", isVisible && "conditional-class", isHidden && "hidden-class");
      expect(result).toBe("base-class conditional-class");
    });

    it("should handle undefined and null values", () => {
      const result = cn("base-class", undefined, null, "final-class");
      expect(result).toBe("base-class final-class");
    });

    it("should merge tailwind classes with conflict resolution", () => {
      const result = cn("p-4 p-6");
      expect(result).toBe("p-6");
    });
  });
});
