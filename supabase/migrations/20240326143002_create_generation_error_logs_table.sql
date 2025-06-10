-- Migration: Create generation error logs table
-- Description: Creates the generation_error_logs table with its indexes and policies
-- Author: AI Assistant
-- Date: 2024-03-26

-- Create generation_error_logs table
create table generation_error_logs (
    id bigserial primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    model varchar not null,
    source_text_hash varchar not null,
    source_text_length integer not null check (source_text_length between 1000 and 10000),
    error_code varchar(100) not null,
    error_message text not null,
    created_at timestamptz not null default now()
);

-- Create index
create index idx_generation_error_logs_user_id on generation_error_logs(user_id);

-- Enable Row Level Security
alter table generation_error_logs enable row level security;

-- Create RLS Policies
create policy "Users can view their own error logs"
    on generation_error_logs for select
    to authenticated
    using (auth.uid() = user_id);

create policy "Users can insert their own error logs"
    on generation_error_logs for insert
    to authenticated
    with check (auth.uid() = user_id);

-- Note: No update/delete policies for error_logs as they should be immutable 