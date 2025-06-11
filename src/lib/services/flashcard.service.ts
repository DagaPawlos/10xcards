import type {
  FlashcardCreateDto,
  FlashcardDto,
  FlashcardUpdateDto,
  FlashcardsListResponseDto,
  Flashcard,
} from "../../types";
import type { SupabaseClient } from "../../db/supabase.client";
import { DEFAULT_USER_ID } from "../../db/supabase.client";

export class FlashcardService {
  constructor(private readonly supabase: SupabaseClient) {}

  async createFlashcards(flashcards: FlashcardCreateDto[]): Promise<FlashcardDto[]> {
    // Start a transaction to ensure all operations are atomic
    const { data: createdFlashcards, error } = await this.supabase
      .from("flashcards")
      .insert(
        flashcards.map((flashcard) => ({
          ...flashcard,
          user_id: DEFAULT_USER_ID, // Add user_id to each flashcard
        }))
      )
      .select();

    if (error) {
      console.error("Error creating flashcards:", error);
      throw new Error("Failed to create flashcards");
    }

    if (!createdFlashcards) {
      throw new Error("No flashcards were created");
    }

    return createdFlashcards;
  }

  async validateGenerationIds(generationIds: number[]): Promise<void> {
    if (generationIds.length === 0) return;

    const { data: generations, error } = await this.supabase
      .from("generations")
      .select("id")
      .in("id", generationIds)
      .eq("user_id", DEFAULT_USER_ID); // Only validate generations belonging to the user

    if (error) {
      throw new Error("Failed to validate generation IDs");
    }

    const foundIds = new Set(generations?.map((g) => g.id) || []);
    const invalidIds = generationIds.filter((id) => !foundIds.has(id));

    if (invalidIds.length > 0) {
      throw new Error(`Invalid generation IDs: ${invalidIds.join(", ")}`);
    }
  }

  async getFlashcards(params: {
    page: number;
    limit: number;
    sort?: string;
    order?: "asc" | "desc";
    source?: string;
    generation_id?: number;
  }): Promise<FlashcardsListResponseDto> {
    try {
      const { page, limit, sort = "created_at", order = "desc", source, generation_id } = params;
      const offset = (page - 1) * limit;

      // Build query
      let query = this.supabase.from("flashcards").select("*", { count: "exact" });

      // Apply filters if provided
      if (source) {
        query = query.eq("source", source);
      }
      if (generation_id) {
        query = query.eq("generation_id", generation_id);
      }

      // Apply sorting and pagination
      const {
        data: flashcards,
        error,
        count,
      } = await query.order(sort, { ascending: order === "asc" }).range(offset, offset + limit - 1);

      if (error) {
        console.error("Database error while fetching flashcards:", {
          error,
          operation: "list_flashcards",
          params: JSON.stringify(params),
        });
        throw new Error("Failed to fetch flashcards");
      }

      if (!flashcards || !count) {
        return {
          data: [],
          pagination: {
            page,
            limit,
            total: 0,
          },
        };
      }

      return {
        data: flashcards,
        pagination: {
          page,
          limit,
          total: count,
        },
      };
    } catch (error) {
      // Log error details for debugging
      console.error("Error in getFlashcards:", {
        error,
        operation: "list_flashcards",
        params: JSON.stringify(params),
      });
      throw error;
    }
  }

  async updateFlashcard(id: number, data: FlashcardUpdateDto): Promise<FlashcardDto> {
    const { data: flashcard, error } = await this.supabase
      .from("flashcards")
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating flashcard:", {
        error,
        operation: "update_flashcard",
        flashcard_id: id,
      });
      if (error.code === "PGRST116") {
        throw new Error("Flashcard not found");
      }
      throw new Error("Failed to update flashcard");
    }

    return flashcard;
  }

  /**
   * Retrieves a single flashcard by its ID.
   * Row Level Security (RLS) ensures the user can only access their own flashcards.
   */
  async getFlashcardById(id: number): Promise<FlashcardDto | null> {
    try {
      const { data, error } = await this.supabase.from("flashcards").select("*").eq("id", id).single();

      if (error) {
        // Handle "not found" case specifically
        if (error.code === "PGRST116") {
          return null;
        }

        console.error("Error fetching flashcard:", {
          error,
          operation: "get_flashcard_by_id",
          flashcard_id: id,
        });
        throw error;
      }

      if (!data) {
        return null;
      }

      return this.mapToDto(data);
    } catch (error) {
      console.error("Error in getFlashcardById:", {
        error,
        operation: "get_flashcard_by_id",
        flashcard_id: id,
      });
      throw error;
    }
  }

  /**
   * Maps a database flashcard record to the DTO format.
   */
  private mapToDto(flashcard: Flashcard): FlashcardDto {
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
}
