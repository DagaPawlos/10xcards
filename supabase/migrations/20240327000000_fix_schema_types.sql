-- Migration: Fix schema types
-- Description: Updates table columns to match the schema diagram
-- Author: AI Assistant
-- Date: 2024-03-27

-- Modify generations table
alter table generations
    alter column id type int,
    alter column generated_count type int4,
    alter column accepted_unedited_count set not null,
    alter column accepted_edited_count set not null,
    alter column source_text_length type int4,
    alter column generation_duration type int4;

-- Modify flashcards table
alter table flashcards
    alter column id type int,
    alter column generation_id type int;

-- Modify generation_error_logs table
alter table generation_error_logs
    alter column id type int,
    alter column source_text_length type int4;

-- Add comments
comment on table generations is 'Table storing information about flashcard generation sessions';
comment on table flashcards is 'Table storing individual flashcards';
comment on table generation_error_logs is 'Table storing error logs from generation attempts'; 