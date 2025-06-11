-- Migration: Fix schema types
-- Description: Updates table columns to match the schema diagram
-- Author: AI Assistant
-- Date: 2024-03-27

-- Modify generations table
alter table generations
    alter column id set data type integer,
    alter column generated_count set data type integer,
    alter column accepted_unedited_count set data type integer,
    alter column accepted_edited_count set data type integer,
    alter column source_text_length set data type integer,
    alter column generation_duration set data type integer;

-- Modify flashcards table
alter table flashcards
    alter column id set data type integer,
    alter column generation_id set data type integer;

-- Modify generation_error_logs table
alter table generation_error_logs
    alter column id set data type integer,
    alter column source_text_length set data type integer;

-- Add comments
comment on table generations is 'Table storing information about flashcard generation sessions';
comment on table flashcards is 'Table storing individual flashcards';
comment on table generation_error_logs is 'Table storing error logs from generation attempts'; 