import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthForm } from "@/components/AuthForm";

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// Mock window.location.href to prevent navigation errors
const mockLocation = {
  href: "",
};
vi.stubGlobal("location", mockLocation);

describe("AuthForm", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", mockFetch);
    mockLocation.href = "";
  });

  describe("Login Mode", () => {
    it("renders login form with correct fields", () => {
      // Arrange & Act
      render(<AuthForm mode="login" />);

      // Assert
      expect(screen.getByText("Sign in")).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.queryByLabelText(/repeat password/i)).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
    });

    it("submits login form with email and password", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: { id: "1", email: "test@example.com" } }),
      });

      render(<AuthForm mode="login" />);

      // Act
      await user.type(screen.getByLabelText(/email/i), "test@example.com");
      await user.type(screen.getByLabelText(/password/i), "password123");
      await user.click(screen.getByRole("button", { name: /sign in/i }));

      // Assert
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "test@example.com",
            password: "password123",
          }),
        });
      });

      // Check navigation
      expect(mockLocation.href).toBe("/generate");
    });

    it("displays error message on login failure", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "Invalid credentials" }),
      });

      render(<AuthForm mode="login" />);

      // Act
      await user.type(screen.getByLabelText(/email/i), "test@example.com");
      await user.type(screen.getByLabelText(/password/i), "wrongpassword");
      await user.click(screen.getByRole("button", { name: /sign in/i }));

      // Assert
      await waitFor(() => {
        expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
      });
    });

    it("shows loading state during login", async () => {
      // Arrange
      let resolvePromise: (() => void) | undefined;
      mockFetch.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolvePromise = () => resolve({ ok: true, json: async () => ({}) });
          })
      );

      render(<AuthForm mode="login" />);

      // Act
      await user.type(screen.getByLabelText(/email/i), "test@example.com");
      await user.type(screen.getByLabelText(/password/i), "password123");
      await user.click(screen.getByRole("button", { name: /sign in/i }));

      // Assert loading state
      await waitFor(() => {
        expect(screen.getByRole("button", { name: /signing in/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /signing in/i })).toBeDisabled();
      });

      // Clean up
      if (resolvePromise) resolvePromise();
    });
  });

  describe("Register Mode", () => {
    it("renders register form with all required fields", () => {
      // Arrange & Act
      render(<AuthForm mode="register" />);

      // Assert
      expect(screen.getByText("Create an account")).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/repeat password/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /register/i })).toBeInTheDocument();
    });

    it("validates password confirmation", async () => {
      // Arrange
      render(<AuthForm mode="register" />);

      // Act
      await user.type(screen.getByLabelText(/email/i), "test@example.com");
      await user.type(screen.getByLabelText(/^password/i), "password123");
      await user.type(screen.getByLabelText(/repeat password/i), "differentpassword");
      await user.click(screen.getByRole("button", { name: /register/i }));

      // Assert
      await waitFor(() => {
        expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
      });
    });

    it("calls parent onSubmit when provided", async () => {
      // Arrange
      const mockOnSubmit = vi.fn();
      render(<AuthForm mode="register" onSubmit={mockOnSubmit} />);

      // Act
      await user.type(screen.getByLabelText(/email/i), "test@example.com");
      await user.type(screen.getByLabelText(/^password/i), "password123");
      await user.type(screen.getByLabelText(/repeat password/i), "password123");
      await user.click(screen.getByRole("button", { name: /register/i }));

      // Assert
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  describe("External Props", () => {
    it("displays external error prop", () => {
      // Arrange & Act
      render(<AuthForm mode="login" error="External error message" />);

      // Assert
      expect(screen.getByText("External error message")).toBeInTheDocument();
    });

    it("displays success message", () => {
      // Arrange & Act
      render(<AuthForm mode="login" success="Registration successful!" />);

      // Assert
      expect(screen.getByText("Registration successful!")).toBeInTheDocument();
    });

    it("shows loading state from external prop", () => {
      // Arrange & Act
      render(<AuthForm mode="login" isLoading={true} />);

      // Assert
      expect(screen.getByRole("button", { name: /signing in/i })).toBeDisabled();
    });
  });

  describe("Form Validation", () => {
    it("prevents submission with empty email", async () => {
      // Arrange
      render(<AuthForm mode="login" />);

      // Act
      await user.click(screen.getByRole("button", { name: /sign in/i }));

      // Assert
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("handles onChange events", async () => {
      // Arrange
      const mockOnChange = vi.fn();
      render(<AuthForm mode="login" onChange={mockOnChange} />);

      // Act
      await user.type(screen.getByLabelText(/email/i), "t");

      // Assert
      expect(mockOnChange).toHaveBeenCalled();
    });
  });
});
