-- Migration: Disable all policies
-- Description: Drops all existing policies from flashcards, generations and generation_error_logs tables
-- Author: AI Assistant
-- Date: 2024-03-27

-- Drop flashcards policies
drop policy if exists "Users can view their own flashcards" on flashcards;
drop policy if exists "Users can insert their own flashcards" on flashcards;
drop policy if exists "Users can update their own flashcards" on flashcards;
drop policy if exists "Users can delete their own flashcards" on flashcards;

-- Drop generations policies
drop policy if exists "Users can view their own generations" on generations;
drop policy if exists "Users can insert their own generations" on generations;
drop policy if exists "Users can update their own generations" on generations;
drop policy if exists "Users can delete their own generations" on generations;

-- Drop generation_error_logs policies
drop policy if exists "Users can view their own error logs" on generation_error_logs;
drop policy if exists "Users can insert their own error logs" on generation_error_logs;

-- Note: After dropping policies, tables will still have RLS enabled but no policies,
-- effectively blocking all access until new policies are created 