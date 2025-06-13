import crypto from "crypto";
import type {
  FlashcardProposalDto,
  GenerationCreateResponseDto,
  GenerationDetailDto,
  FlashcardDto,
  Generation,
  Flashcard,
  GenerationsListResponseDto,
} from "../../types";
import type { SupabaseClient } from "@supabase/supabase-js";
import { OpenRouterService } from "./openrouter.service";
import { Logger } from "../logger";
import { DEFAULT_USER_ID } from "../../db/supabase.client";

interface ListGenerationsParams {
  page: number;
  limit: number;
  sort: "created_at" | "updated_at";
  order: "asc" | "desc";
}

export class GenerationService {
  private readonly logger: Logger;
  private readonly openRouter: OpenRouterService;

  constructor(
    private readonly supabase: SupabaseClient,
    openRouterConfig?: { apiKey: string }
  ) {
    this.logger = new Logger("GenerationService");

    if (!openRouterConfig?.apiKey) {
      throw new Error("OpenRouter API key is required");
    }

    this.openRouter = new OpenRouterService({
      apiKey: openRouterConfig.apiKey,
    });
  }

  async generateFlashcards(sourceText: string): Promise<GenerationCreateResponseDto> {
    try {
      // 1. Calculate metadata
      const startTime = Date.now();
      const sourceTextHash = await this.calculateHash(sourceText);

      // 2. Call AI service to generate flashcards
      const proposals = await this.callAIService(sourceText);

      // 3. Save generation metadata
      const generationId = await this.saveGenerationMetadata({
        sourceText,
        sourceTextHash,
        generatedCount: proposals.length,
        durationMs: Date.now() - startTime,
      });

      return {
        generation_id: generationId,
        flashcards_proposals: proposals,
        generated_count: proposals.length,
      };
    } catch (error) {
      // Log error and save to generation_error_logs
      await this.logGenerationError(error, {
        sourceTextHash: await this.calculateHash(sourceText),
        sourceTextLength: sourceText.length,
      });
      throw error;
    }
  }

  private async callAIService(text: string): Promise<FlashcardProposalDto[]> {
    try {
      // Set up system message to instruct the model
      this.openRouter.setSystemMessage(
        "Jesteś pomocnym asystentem, który tworzy fiszki z podanego tekstu w języku polskim. " +
          "Każda fiszka powinna mieć jasne pytanie na przodzie i zwięzłą odpowiedź na odwrocie. " +
          "Skup się na kluczowych pojęciach i ważnych szczegółach. " +
          "Upewnij się, że pytania są konkretne, a odpowiedzi precyzyjne. " +
          "ZAWSZE zwracaj odpowiedź w formacie JSON z tablicą obiektów 'flashcards', gdzie każdy obiekt ma pola 'front' i 'back'."
      );

      // Set user message with the text to process
      this.openRouter.setUserMessage(
        "Utwórz fiszki z poniższego tekstu. " +
          "Każda fiszka musi być obiektem JSON z polami 'front' (pytanie) i 'back' (odpowiedź). " +
          "Wygeneruj od 3 do 10 wysokiej jakości fiszek. " +
          "WAŻNE: Odpowiedź MUSI być w formacie JSON z tablicą 'flashcards'. " +
          "Przykład prawidłowego formatu odpowiedzi:\n" +
          '{\n  "flashcards": [\n    {"front": "Pytanie 1?", "back": "Odpowiedź 1"},\n    {"front": "Pytanie 2?", "back": "Odpowiedź 2"}\n  ]\n}\n\n' +
          "Tekst do przetworzenia:\n\n" +
          text
      );

      interface FlashcardResponse {
        flashcards: {
          front: string;
          back: string;
        }[];
      }

      // Configure response format for structured output
      const response = await this.openRouter.getChatCompletion({
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "flashcards_generation",
            strict: true,
            schema: {
              type: "object",
              properties: {
                flashcards: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      front: { type: "string" },
                      back: { type: "string" },
                    },
                    required: ["front", "back"],
                  },
                  minItems: 3,
                  maxItems: 10,
                },
              },
              required: ["flashcards"],
            },
          },
        },
      });

      this.logger.info("Received response from OpenRouter", {
        response: JSON.stringify(response),
      });

      // Transform the AI response into FlashcardProposalDto[]
      if (typeof response === "string") {
        try {
          const parsedResponse = JSON.parse(response) as FlashcardResponse;
          if (Array.isArray(parsedResponse.flashcards)) {
            return parsedResponse.flashcards.map((card) => ({
              front: card.front,
              back: card.back,
              source: "ai-full" as const,
            }));
          }
          throw new Error("Response does not contain flashcards array");
        } catch (parseError) {
          this.logger.error(parseError as Error, {
            operation: "parse_ai_response",
            response: response,
          });
          throw new Error("Failed to parse AI response");
        }
      }

      if (
        response &&
        typeof response === "object" &&
        "flashcards" in response &&
        Array.isArray((response as FlashcardResponse).flashcards)
      ) {
        const typedResponse = response as FlashcardResponse;
        return typedResponse.flashcards.map((card) => ({
          front: card.front,
          back: card.back,
          source: "ai-full" as const,
        }));
      }

      this.logger.error(new Error("Invalid response format"), {
        operation: "validate_ai_response",
        response: JSON.stringify(response),
      });
      throw new Error("Invalid response format from AI service");
    } catch (error) {
      this.logger.error(error as Error, {
        operation: "generate_flashcards",
        textLength: text.length,
      });
      throw new Error("Failed to generate flashcards using AI service");
    }
  }

  private async calculateHash(text: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  private async saveGenerationMetadata(data: {
    sourceText: string;
    sourceTextHash: string;
    generatedCount: number;
    durationMs: number;
  }) {
    // Using DEFAULT_USER_ID from supabase.client.ts
    const { data: generation, error } = await this.supabase
      .from("generations")
      .insert({
        user_id: DEFAULT_USER_ID,
        source_text_hash: data.sourceTextHash,
        source_text_length: data.sourceText.length,
        model: this.openRouter.getCurrentModelName(),
        generated_count: data.generatedCount,
        generation_duration: data.durationMs,
        accepted_unedited_count: 0,
        accepted_edited_count: 0,
      })
      .select("id")
      .single();

    if (error) {
      this.logger.error(error, {
        operation: "save_generation_metadata",
        data: JSON.stringify(data),
      });
      throw new Error("Failed to save generation metadata");
    }

    return generation.id;
  }

  private async logGenerationError(
    error: unknown,
    context: {
      sourceTextHash: string;
      sourceTextLength: number;
    }
  ) {
    try {
      await this.supabase.from("generation_error_logs").insert({
        error_message: error instanceof Error ? error.message : "Unknown error",
        error_stack: error instanceof Error ? error.stack : null,
        source_text_hash: context.sourceTextHash,
        source_text_length: context.sourceTextLength,
      });
    } catch (logError) {
      // Just log to console if we can't save to database
      console.error("Failed to log generation error:", logError);
    }
  }

  /**
   * Retrieves a generation by its ID along with associated flashcards.
   * Row Level Security (RLS) ensures the user can only access their own generations.
   * @param id The ID of the generation to retrieve
   * @returns The generation details with flashcards or null if not found
   * @throws Error if there's a database error
   */
  async getGenerationById(id: number): Promise<GenerationDetailDto | null> {
    try {
      const { data: generation, error } = await this.supabase
        .from("generations")
        .select(
          `
          *,
          flashcards (*)
        `
        )
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null;
        }
        console.error("Error fetching generation:", {
          error,
          operation: "get_generation_by_id",
          generation_id: id,
        });
        throw error;
      }

      if (!generation) {
        return null;
      }

      return this.mapToDto(generation);
    } catch (error) {
      // Log error details for debugging
      console.error("Error in getGenerationById:", {
        error,
        operation: "get_generation_by_id",
        generation_id: id,
      });
      throw error;
    }
  }

  /**
   * Maps a database generation record to the DTO format.
   * @private
   */
  private mapToDto(generation: Generation & { flashcards: Flashcard[] }): GenerationDetailDto {
    return {
      id: generation.id,
      user_id: generation.user_id,
      model: generation.model,
      generated_count: generation.generated_count,
      accepted_unedited_count: generation.accepted_unedited_count,
      accepted_edited_count: generation.accepted_edited_count,
      source_text_hash: generation.source_text_hash,
      source_text_length: generation.source_text_length,
      generation_duration: generation.generation_duration,
      created_at: generation.created_at,
      updated_at: generation.updated_at,
      flashcards: generation.flashcards?.map((flashcard) => this.mapFlashcardToDto(flashcard)),
    };
  }

  /**
   * Maps a database flashcard record to the DTO format.
   * @private
   */
  private mapFlashcardToDto(flashcard: Flashcard): FlashcardDto {
    return {
      id: flashcard.id,
      front: flashcard.front,
      back: flashcard.back,
      source: flashcard.source,
      generation_id: flashcard.generation_id,
      created_at: flashcard.created_at,
      updated_at: flashcard.updated_at,
    };
  }

  async getGenerations(params: ListGenerationsParams): Promise<GenerationsListResponseDto> {
    // Calculate offset for pagination
    const offset = params.limit * (params.page - 1);

    // Get total count
    const { count, error: countError } = await this.supabase
      .from("generations")
      .select("*", { count: "exact", head: true });

    if (countError) {
      console.error("Error counting generations:", {
        error: countError,
        operation: "count_generations",
      });
      throw countError;
    }

    // Get paginated data
    const { data, error: dataError } = await this.supabase
      .from("generations")
      .select("*")
      .order(params.sort, { ascending: params.order === "asc" })
      .range(offset, offset + params.limit - 1);

    if (dataError) {
      console.error("Error fetching generations:", {
        error: dataError,
        params,
        operation: "get_generations",
      });
      throw dataError;
    }

    return {
      data: data || [],
      pagination: {
        page: params.page,
        limit: params.limit,
        total: count || 0,
      },
    };
  }
}
