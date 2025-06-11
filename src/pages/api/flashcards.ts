import { z } from "zod";
import type { APIRoute } from "astro";
import type { FlashcardsCreateCommand } from "../../types";
import { FlashcardService } from "../../lib/services/flashcard.service";

export const prerender = false;

// Validation schemas
const flashcardCreateSchema = z.object({
  front: z.string().max(200, "Front text must not exceed 200 characters"),
  back: z.string().max(500, "Back text must not exceed 500 characters"),
  source: z.enum(["ai-full", "ai-edited", "manual"], {
    errorMap: () => ({ message: "Source must be one of: ai-full, ai-edited, manual" }),
  }),
  generation_id: z.number().nullable(),
});

const flashcardsCreateSchema = z.object({
  flashcards: z
    .array(flashcardCreateSchema)
    .min(1, "At least one flashcard is required")
    .max(100, "Maximum 100 flashcards can be created at once")
    .refine(
      (cards) =>
        cards.every(
          (card) =>
            (card.source === "manual" && card.generation_id === null) ||
            (["ai-full", "ai-edited"].includes(card.source) && card.generation_id !== null)
        ),
      {
        message: "generation_id must be null for manual source and must be provided for ai-full or ai-edited source",
      }
    ),
});

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Parse and validate request body
    const body = (await request.json()) as FlashcardsCreateCommand;
    const validationResult = flashcardsCreateSchema.safeParse(body);

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

    const flashcardService = new FlashcardService(locals.supabase);

    try {
      // Validate generation IDs before creating flashcards
      const generationIds = validationResult.data.flashcards
        .map((f) => f.generation_id)
        .filter((id): id is number => id !== null);

      await flashcardService.validateGenerationIds(generationIds);
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: "Invalid generation IDs",
          message: error instanceof Error ? error.message : "One or more generation IDs are invalid",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Create flashcards
    const createdFlashcards = await flashcardService.createFlashcards(validationResult.data.flashcards);

    return new Response(JSON.stringify({ flashcards: createdFlashcards }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing flashcards creation request:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: "Failed to create flashcards",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

// Validation schema for query parameters
const listFlashcardsSchema = z.object({
  page: z.coerce.number().positive().default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  sort: z.enum(["created_at", "updated_at"]).optional(),
  order: z.enum(["asc", "desc"]).default("desc"),
  source: z.enum(["ai-full", "ai-edited", "manual"]).optional(),
  generation_id: z.coerce.number().optional(),
});

export const GET: APIRoute = async ({ url, locals }) => {
  try {
    // Parse and validate query parameters
    const searchParams = Object.fromEntries(url.searchParams.entries());
    const validationResult = listFlashcardsSchema.safeParse(searchParams);

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

    const flashcardService = new FlashcardService(locals.supabase);
    const response = await flashcardService.getFlashcards(validationResult.data);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing flashcards request:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
