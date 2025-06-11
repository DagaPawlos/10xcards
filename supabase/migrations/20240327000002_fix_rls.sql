-- Migration: Fix RLS settings
-- Description: Disables RLS on tables for development purposes
-- Author: AI Assistant
-- Date: 2024-03-27

-- Disable RLS on tables
alter table generations disable row level security;
alter table flashcards disable row level security;
alter table generation_error_logs disable row level security; 