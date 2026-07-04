-- ─────────────────────────────────────────────────────────────────────────────
-- SignSync Database Schema
-- Run this once in your Supabase project:
--   Supabase Dashboard → SQL Editor → paste this file → Run
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ── profiles ─────────────────────────────────────────────────────────────────
-- Extends Supabase auth.users. One row per registered user.
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null default '',
  email       text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Auto-create a profile row when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── sessions ─────────────────────────────────────────────────────────────────
create table if not exists public.sessions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  title       text not null default 'Translation session',
  type        text not null default 'translation'  check (type in ('conversation','practice','translation')),
  started_at  timestamptz not null default now(),
  ended_at    timestamptz,
  duration_s  int generated always as (
                extract(epoch from (ended_at - started_at))::int
              ) stored,
  accuracy    numeric(5,2) check (accuracy >= 0 and accuracy <= 100),
  notes       text
);

-- ── gesture_logs ─────────────────────────────────────────────────────────────
create table if not exists public.gesture_logs (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid references public.sessions(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  gesture     text not null,
  confidence  numeric(4,2) not null check (confidence >= 0 and confidence <= 1),
  sentence    text,
  logged_at   timestamptz not null default now()
);

-- ── speech_logs ──────────────────────────────────────────────────────────────
create table if not exists public.speech_logs (
  id          uuid primary key default gen_random_uuid(),
  session_id  uuid references public.sessions(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  transcript  text not null,
  confidence  numeric(4,2) not null check (confidence >= 0 and confidence <= 1),
  language    text not null default 'en-US',
  logged_at   timestamptz not null default now()
);

-- ── Row Level Security ────────────────────────────────────────────────────────
-- Users can only read/write their own data.

alter table public.profiles      enable row level security;
alter table public.sessions      enable row level security;
alter table public.gesture_logs  enable row level security;
alter table public.speech_logs   enable row level security;

-- profiles
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- sessions
create policy "Users can view own sessions"
  on public.sessions for select using (auth.uid() = user_id);
create policy "Users can insert own sessions"
  on public.sessions for insert with check (auth.uid() = user_id);
create policy "Users can update own sessions"
  on public.sessions for update using (auth.uid() = user_id);
create policy "Users can delete own sessions"
  on public.sessions for delete using (auth.uid() = user_id);

-- gesture_logs
create policy "Users can view own gesture logs"
  on public.gesture_logs for select using (auth.uid() = user_id);
create policy "Users can insert own gesture logs"
  on public.gesture_logs for insert with check (auth.uid() = user_id);

-- speech_logs
create policy "Users can view own speech logs"
  on public.speech_logs for select using (auth.uid() = user_id);
create policy "Users can insert own speech logs"
  on public.speech_logs for insert with check (auth.uid() = user_id);
