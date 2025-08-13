import { createClient } from "@supabase/supabase-js";

/**
 * Global teardown for E2E tests
 * This runs once after all tests complete to clean up test data
 */
export default async function globalTeardown() {
  // eslint-disable-next-line no-console
  console.log("🧹 Starting E2E test cleanup...");

  // Skip cleanup if required environment variables are missing
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_PUBLIC_KEY) {
    // eslint-disable-next-line no-console
    console.log("⚠️  Skipping cleanup - missing Supabase configuration");
    return;
  }

  if (!process.env.E2E_USERNAME || !process.env.E2E_PASSWORD) {
    // eslint-disable-next-line no-console
    console.log("⚠️  Skipping cleanup - missing test user credentials");
    return;
  }

  try {
    // Create Supabase client for cleanup
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_PUBLIC_KEY);

    // Sign in as test user to bypass RLS policies
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: process.env.E2E_USERNAME,
      password: process.env.E2E_PASSWORD,
    });

    if (signInError) {
      // eslint-disable-next-line no-console
      console.error("❌ Error signing in for cleanup:", signInError);
      throw signInError;
    }

    // eslint-disable-next-line no-console
    console.log("✅ Authenticated for cleanup");

    // Get current user to filter test data
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      // eslint-disable-next-line no-console
      console.error("❌ Error getting user for cleanup:", userError);
      return;
    }

    // Clean up test data - flashcards created by test user
    const { error: flashcardsError } = await supabase.from("flashcards").delete().eq("user_id", user.id);

    if (flashcardsError) {
      // eslint-disable-next-line no-console
      console.error("❌ Error cleaning up flashcards:", flashcardsError);
    } else {
      // eslint-disable-next-line no-console
      console.log("🗑️  Cleaned up flashcards");
    }

    // Clean up test data - generations created by test user
    const { error: generationsError } = await supabase.from("generations").delete().eq("user_id", user.id);

    if (generationsError) {
      // eslint-disable-next-line no-console
      console.error("❌ Error cleaning up generations:", generationsError);
    } else {
      // eslint-disable-next-line no-console
      console.log("🗑️  Cleaned up generations");
    }

    // Clean up test data - generation error logs created by test user
    const { error: errorLogsError } = await supabase.from("generation_error_logs").delete().eq("user_id", user.id);

    if (errorLogsError) {
      // eslint-disable-next-line no-console
      console.error("❌ Error cleaning up error logs:", errorLogsError);
    } else {
      // eslint-disable-next-line no-console
      console.log("🗑️  Cleaned up error logs");
    }

    // Sign out after cleanup
    await supabase.auth.signOut();

    // eslint-disable-next-line no-console
    console.log("✅ E2E test cleanup completed successfully");
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("❌ E2E test cleanup failed:", error);
    // Don't throw error as it would fail the entire test suite
  }
}
