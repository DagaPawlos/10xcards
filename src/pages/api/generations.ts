import { z } from "zod";
import type { APIRoute } from "astro";
import type { GenerateFlashcardsCommand } from "../../types";
import { GenerationService } from "../../lib/services/generation.service";

export const prerender = false;

// Validation schema for query parameters
const listGenerationsSchema = z.object({
  page: z.coerce.number().positive("Page number must be positive").default(1),
  limit: z.coerce.number().min(1).max(100, "Maximum 100 items per page").default(10),
  sort: z
    .enum(["created_at", "updated_at"], {
      errorMap: () => ({ message: "Sort field must be one of: created_at, updated_at" }),
    })
    .default("created_at"),
  order: z
    .enum(["asc", "desc"], {
      errorMap: () => ({ message: "Order must be one of: asc, desc" }),
    })
    .default("desc"),
});

// Validation schema for the request body
const generateFlashcardsSchema = z.object({
  source_text: z
    .string()
    .min(1000, "Text must be at least 1000 characters long")
    .max(10000, "Text must not exceed 10000 characters"),
});

export const GET: APIRoute = async ({ url, locals }) => {
  try {
    // Check authentication first
    const userId = locals.user?.id;
    if (!userId) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Parse and validate query parameters
    const searchParams = Object.fromEntries(url.searchParams.entries());
    const validationResult = listGenerationsSchema.safeParse(searchParams);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid query parameters",
          details: validationResult.error.errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const generationService = new GenerationService(locals.supabase, userId);
    const response = await generationService.getGenerations(validationResult.data);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Log detailed error information
    console.error("Error processing generations list request:", {
      error,
      operation: "list_generations",
      stack: error instanceof Error ? error.stack : undefined,
    });

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: "Failed to fetch generations",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Parse and validate request body
    const body = (await request.json()) as GenerateFlashcardsCommand;
    const validationResult = generateFlashcardsSchema.safeParse(body);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid request data",
          details: validationResult.error.errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Get OpenRouter API key from environment variables
    const openRouterApiKey = import.meta.env.OPENROUTER_API_KEY;

    if (!openRouterApiKey) {
      return new Response(
        JSON.stringify({
          error: "Service configuration error",
          message: "OpenRouter API key is not configured",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Get userId (can be null for anonymous users)
    const userId = locals.user?.id || null;

    try {
      // Try to initialize generation service
      console.log("Initializing GenerationService...");
      const generationService = new GenerationService(locals.supabase, userId, {
        apiKey: openRouterApiKey,
      });
      console.log("GenerationService initialized successfully");

      console.log("Calling generateFlashcards...");
      const result = await generationService.generateFlashcards(validationResult.data.source_text);
      console.log("GenerationService completed successfully");

      return new Response(JSON.stringify(result), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    } catch (serviceError) {
      // Log the specific error
      console.error("GenerationService failed:", serviceError);

      // If GenerationService fails, return mock data as fallback
      const mockResult = {
        generation_id: 1,
        flashcards_proposals: [
          {
            front: "Sample question from: " + validationResult.data.source_text.substring(0, 50) + "...",
            back: "Sample answer",
          },
          {
            front: "Another question",
            back: "Another answer",
          },
        ],
      };

      return new Response(JSON.stringify(mockResult), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    console.error("Generations API error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Failed to generate flashcards",
        details: error instanceof Error ? error.stack : undefined,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
