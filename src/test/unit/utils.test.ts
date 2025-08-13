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

    it("should handle empty strings", () => {
      const result = cn("text-center", "", "p-4");
      expect(result).toBe("text-center p-4");
    });

    it("should handle array of classes", () => {
      const result = cn(["text-center", "bg-blue-500"], "p-4");
      expect(result).toBe("text-center bg-blue-500 p-4");
    });

    it("should handle object notation for conditional classes", () => {
      const result = cn({
        "text-center": true,
        "bg-blue-500": true,
        "text-red-500": false,
      });
      expect(result).toBe("text-center bg-blue-500");
    });

    it("should handle no arguments", () => {
      const result = cn();
      expect(result).toBe("");
    });

    it("should handle complex component style combinations", () => {
      // Arrange - simulate button component variants
      const size = Math.random() > 0.5 ? "large" : "small";
      const variant = Math.random() > 0.5 ? "primary" : "secondary";
      const isDisabled = false;

      // Act
      const result = cn(
        "button font-medium rounded-md transition-colors",
        size === "large" && "text-lg px-6 py-3",
        size === "small" && "text-sm px-3 py-1.5",
        variant === "primary" && "bg-blue-500 text-white hover:bg-blue-600",
        variant === "secondary" && "bg-gray-200 text-gray-900 hover:bg-gray-300",
        isDisabled && "opacity-50 cursor-not-allowed pointer-events-none"
      );

      // Assert - test that function works with dynamic values
      expect(result).toContain("button font-medium rounded-md transition-colors");
      if (size === "large") {
        expect(result).toContain("text-lg px-6 py-3");
      }
      if (variant === "primary") {
        expect(result).toContain("bg-blue-500 text-white hover:bg-blue-600");
      }
    });

    it("should handle tailwind class conflicts correctly", () => {
      // Arrange & Act - later classes should override earlier ones
      const result = cn("bg-red-500 bg-blue-500", "text-sm text-lg");

      // Assert - should keep the last conflicting class
      expect(result).toBe("bg-blue-500 text-lg");
    });

    it("should handle SavedFlashcardsList component style patterns", () => {
      // Arrange - simulate flashcard card style combination
      const baseCard = "p-6 bg-white shadow-sm rounded-lg transition-shadow";
      const errorState = "border-red-200 bg-red-50 border-l-4 border-l-green-500";

      // Act
      const cardClasses = cn(baseCard, errorState);

      // Assert - tailwind-merge should resolve conflicts (bg-white vs bg-red-50)
      expect(cardClasses).toContain("p-6 shadow-sm rounded-lg transition-shadow");
      expect(cardClasses).toContain("bg-red-50"); // Should win over bg-white
      expect(cardClasses).toContain("border-red-200");
    });

    it("should handle button state combinations from UI components", () => {
      // Arrange - simulate Button component from SavedFlashcardsList
      const variant = Math.random() > 0.5 ? "outline" : "default";
      const size = Math.random() > 0.66 ? "sm" : Math.random() > 0.33 ? "default" : "lg";
      const isDisabled = true;

      // Act
      const buttonClasses = cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-colors",
        variant === "default" && "bg-primary text-primary-foreground hover:bg-primary/90",
        variant === "outline" && "border bg-background hover:bg-accent hover:text-accent-foreground",
        size === "default" && "h-9 px-4 py-2",
        size === "sm" && "h-8 px-3 text-sm",
        size === "lg" && "h-10 px-6",
        isDisabled && "opacity-50 pointer-events-none"
      );

      // Assert
      expect(buttonClasses).toContain(
        "inline-flex items-center justify-center rounded-md font-medium transition-colors"
      );
      expect(buttonClasses).toContain("opacity-50 pointer-events-none");
    });
  });
});
