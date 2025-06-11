import type { FlashcardCreateDto, FlashcardDto } from "../../types";
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
}
