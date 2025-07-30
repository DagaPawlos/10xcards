import { z } from "zod";
import type { APIRoute } from "astro";
import type { FlashcardDto } from "../../../types";
import { FlashcardService } from "../../../lib/services/flashcard.service";

export const prerender = false;

// Validation schema for the ID parameter
const paramsSchema = z.object({
  id: z.coerce.number().positive("Flashcard ID must be a positive number").int("Flashcard ID must be an integer"),
});

// Validation schema for the update data
const updateSchema = z.object({
  front: z.string().min(1, "Front text is required").max(1000, "Front text is too long"),
  back: z.string().min(1, "Back text is required").max(1000, "Back text is too long"),
});

export const GET: APIRoute = async ({ params, locals }): Promise<Response> => {
  try {
    // Check authentication first
    const userId = locals.user?.id;
    if (!userId) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

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
    const flashcardService = new FlashcardService(locals.supabase, userId);
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
  } catch {
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

export const PUT: APIRoute = async ({ params, request, locals }): Promise<Response> => {
  try {
    // Check authentication first
    const userId = locals.user?.id;
    if (!userId) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate the ID parameter
    const paramsValidation = paramsSchema.safeParse(params);
    if (!paramsValidation.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid flashcard ID",
          details: paramsValidation.error.errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Parse and validate the request body
    const requestBody = await request.json();
    const bodyValidation = updateSchema.safeParse(requestBody);
    if (!bodyValidation.success) {
      return new Response(
        JSON.stringify({
          error: "Invalid request data",
          details: bodyValidation.error.errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const flashcardService = new FlashcardService(locals.supabase, userId);
    const updatedFlashcard = await flashcardService.updateFlashcard(paramsValidation.data.id, {
      front: bodyValidation.data.front,
      back: bodyValidation.data.back,
    });

    return new Response(JSON.stringify(updatedFlashcard), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Flashcard not found") {
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

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: "Failed to update flashcard",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

export const DELETE: APIRoute = async ({ params, locals }): Promise<Response> => {
  try {
    // Check authentication first
    const userId = locals.user?.id;
    if (!userId) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate the ID parameter
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

    const flashcardService = new FlashcardService(locals.supabase, userId);
    await flashcardService.deleteFlashcard(validationResult.data.id);

    return new Response(
      JSON.stringify({
        message: "Flashcard successfully deleted",
        id: validationResult.data.id,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "Flashcard not found") {
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

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: "Failed to delete flashcard",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
