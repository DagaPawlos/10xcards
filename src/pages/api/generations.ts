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
    // Parse and validate query parameters
    const searchParams = Object.fromEntries(url.searchParams.entries());
    const validationResult = listGenerationsSchema.safeParse(searchParams);

    if (!validationResult.success) {
      console.error("Invalid query parameters:", {
        errors: validationResult.error.errors,
        params: searchParams,
        operation: "validate_list_generations_params",
      });

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

    const generationService = new GenerationService(locals.supabase);
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

    // Initialize generation service with OpenRouter config
    const generationService = new GenerationService(locals.supabase, {
      apiKey: openRouterApiKey,
    });

    const result = await generationService.generateFlashcards(validationResult.data.source_text);

    return new Response(JSON.stringify(result), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing generation request:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Failed to generate flashcards",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
