import { z } from "zod";
import type { APIRoute } from "astro";
import type { FlashcardDto } from "../../../types";
import { FlashcardService } from "../../../lib/services/flashcard.service";

export const prerender = false;

// Validation schema for the ID parameter
const paramsSchema = z.object({
  id: z.coerce.number().positive("Flashcard ID must be a positive number").int("Flashcard ID must be an integer"),
});

export const GET: APIRoute = async ({ params, locals }): Promise<Response> => {
  try {
    // Parse and validate the ID parameter
    const validationResult = paramsSchema.safeParse(params);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid flashcard ID",
          details: validationResult.error.errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Initialize flashcard service and fetch the flashcard
    const flashcardService = new FlashcardService(locals.supabase);
    const flashcard: FlashcardDto | null = await flashcardService.getFlashcardById(validationResult.data.id);

    if (!flashcard) {
      return new Response(
        JSON.stringify({
          error: "Flashcard not found",
          message: "The requested flashcard does not exist or you don't have access to it",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify(flashcard), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing flashcard request:", {
      error,
      params,
      operation: "get_flashcard",
    });

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: "Failed to fetch flashcard",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
