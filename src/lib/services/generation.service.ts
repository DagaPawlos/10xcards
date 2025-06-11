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
import type { SupabaseClient } from "../../db/supabase.client";
import { DEFAULT_USER_ID } from "../../db/supabase.client";

interface ListGenerationsParams {
  page: number;
  limit: number;
  sort: "created_at" | "updated_at";
  order: "asc" | "desc";
}

export class GenerationService {
  constructor(private readonly supabase: SupabaseClient) {}

  async generateFlashcards(sourceText: string): Promise<GenerationCreateResponseDto> {
    try {
      // 1. Calculate metadata
      const startTime = Date.now();

      const sourceTextHash = await this.calculateHash(sourceText);

      // 2. Call AI service (mock for now)
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

  private async calculateHash(text: string): Promise<string> {
    return crypto.createHash("md5").update(text).digest("hex");
  }

  private async callAIService(text: string): Promise<FlashcardProposalDto[]> {
    // Mock implementation with artificial delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Generate 3 mock flashcards based on text length
    return Array.from({ length: 3 }, (_, i) => ({
      front: `Mock Question ${i + 1} (text length: ${text.length})`,
      back: `Mock Answer ${i + 1}`,
      source: "ai-full" as const,
    }));
  }

  private async saveGenerationMetadata(data: {
    sourceText: string;
    sourceTextHash: string;
    generatedCount: number;
    durationMs: number;
  }): Promise<number> {
    const { data: generation, error } = await this.supabase
      .from("generations")
      .insert({
        user_id: DEFAULT_USER_ID,
        source_text_hash: data.sourceTextHash,
        source_text_length: data.sourceText.length,
        generated_count: data.generatedCount,
        generation_duration: data.durationMs,
        model: "gpt-4", // TODO: Make configurable
        accepted_edited_count: 0,
        accepted_unedited_count: 0,
      })
      .select("id")
      .single();

    if (error) throw error;
    return generation.id;
  }

  private async logGenerationError(
    error: unknown,
    data: {
      sourceTextHash: string;
      sourceTextLength: number;
    }
  ): Promise<void> {
    await this.supabase.from("generation_error_logs").insert({
      user_id: DEFAULT_USER_ID,
      error_code: error instanceof Error ? error.name : "UNKNOWN",
      error_message: error instanceof Error ? error.message : String(error),
      model: "gpt-4", // TODO: Make configurable
      source_text_hash: data.sourceTextHash,
      source_text_length: data.sourceTextLength,
    });
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
