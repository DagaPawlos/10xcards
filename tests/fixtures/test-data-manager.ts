import { createClient } from "@supabase/supabase-js";
import { E2E_CONFIG } from "./e2e-config";

/**
 * Test data management helper for E2E tests
 * Provides methods to create and clean up test data during tests
 */
export class TestDataManager {
  private supabase;

  constructor() {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_PUBLIC_KEY) {
      throw new Error("Missing Supabase configuration for test data manager");
    }

    this.supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_PUBLIC_KEY);
  }

  /**
   * Authenticate as test user for data operations
   */
  async authenticate() {
    const { error: signInError } = await this.supabase.auth.signInWithPassword({
      email: E2E_CONFIG.testUser.email,
      password: E2E_CONFIG.testUser.password,
    });

    if (signInError) {
      throw new Error(`Authentication failed for test data manager: ${signInError.message}`);
    }

    return this.supabase;
  }

  /**
   * Create sample flashcards for testing
   */
  async createSampleFlashcards(count = 3) {
    await this.authenticate();

    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated in test data manager");
    }

    const sampleFlashcards = Array.from({ length: count }, (_, index) => ({
      question: `Test Question ${index + 1}`,
      answer: `Test Answer ${index + 1}`,
      user_id: user.id,
    }));

    const { data, error } = await this.supabase.from("flashcards").insert(sampleFlashcards).select();

    if (error) {
      throw new Error(`Failed to create sample flashcards: ${error.message}`);
    }

    return data;
  }

  /**
   * Create sample generation for testing
   */
  async createSampleGeneration(inputText = "Sample text for generation") {
    await this.authenticate();

    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated in test data manager");
    }

    const { data, error } = await this.supabase
      .from("generations")
      .insert({
        input_text: inputText,
        user_id: user.id,
        status: "completed",
      })
      .select();

    if (error) {
      throw new Error(`Failed to create sample generation: ${error.message}`);
    }

    return data[0];
  }

  /**
   * Clean up specific flashcards by IDs
   */
  async cleanupFlashcards(flashcardIds: string[]) {
    await this.authenticate();

    const { error } = await this.supabase.from("flashcards").delete().in("id", flashcardIds);

    if (error) {
      throw new Error(`Failed to cleanup flashcards: ${error.message}`);
    }
  }

  /**
   * Clean up specific generation by ID
   */
  async cleanupGeneration(generationId: string) {
    await this.authenticate();

    const { error } = await this.supabase.from("generations").delete().eq("id", generationId);

    if (error) {
      throw new Error(`Failed to cleanup generation: ${error.message}`);
    }
  }

  /**
   * Get all flashcards for current test user
   */
  async getUserFlashcards() {
    await this.authenticate();

    const {
      data: { user },
    } = await this.supabase.auth.getUser();

    if (!user) {
      throw new Error("User not authenticated in test data manager");
    }

    const { data, error } = await this.supabase
      .from("flashcards")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to get user flashcards: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Sign out current user
   */
  async signOut() {
    await this.supabase.auth.signOut();
  }
}
