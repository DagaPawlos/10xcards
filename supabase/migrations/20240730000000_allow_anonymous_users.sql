-- Migration: Allow nullable user_id for anonymous generations
-- Description: Changes user_id columns to nullable to support anonymous usage
-- Author: AI Assistant
-- Date: 2024-07-30

-- Modify generations table to allow nullable user_id
alter table generations 
    alter column user_id drop not null;

-- Remove foreign key constraint temporarily and recreate it with nullable support
alter table generations 
    drop constraint if exists generations_user_id_fkey;
    
alter table generations 
    add constraint generations_user_id_fkey 
    foreign key (user_id) references auth.users(id) on delete cascade;

-- Modify flashcards table to allow nullable user_id  
alter table flashcards 
    alter column user_id drop not null;

-- Remove foreign key constraint temporarily and recreate it with nullable support
alter table flashcards 
    drop constraint if exists flashcards_user_id_fkey;
    
alter table flashcards 
    add constraint flashcards_user_id_fkey 
    foreign key (user_id) references auth.users(id) on delete cascade;

-- Modify generation_error_logs table to allow nullable user_id
alter table generation_error_logs 
    alter column user_id drop not null;

-- Remove foreign key constraint temporarily and recreate it with nullable support
alter table generation_error_logs 
    drop constraint if exists generation_error_logs_user_id_fkey;
    
alter table generation_error_logs 
    add constraint generation_error_logs_user_id_fkey 
    foreign key (user_id) references auth.users(id) on delete cascade;
