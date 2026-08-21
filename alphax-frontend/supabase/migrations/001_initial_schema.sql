-- ============================================================
-- AlphaX Phase 2 — Database Schema & RLS
-- Run this in the Supabase SQL Editor (Project > SQL Editor)
-- ============================================================

-- ─── Enable UUID extension ────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── profiles ─────────────────────────────────────────────────
create table if not exists public.profiles (
  id               uuid primary key references auth.users(id) on delete cascade,
  full_name        text,
  display_name     text,
  timezone         text not null default 'UTC',
  trading_style    text,
  primary_market   text,
  default_account_size numeric(18,2),
  default_risk_pct     numeric(5,2),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ─── watchlists ───────────────────────────────────────────────
create table if not exists public.watchlists (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  symbol     text not null,
  name       text not null,
  category   text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ─── user_settings ────────────────────────────────────────────
create table if not exists public.user_settings (
  user_id                uuid primary key references public.profiles(id) on delete cascade,
  notify_price_alerts    boolean not null default false,
  notify_high_impact     boolean not null default true,
  notify_risk_alerts     boolean not null default true,
  notify_journal         boolean not null default false,
  theme                  text not null default 'dark',
  accent_color           text not null default '#2F81F7',
  density                text not null default 'default',
  updated_at             timestamptz not null default now()
);

-- ─── Indexes ──────────────────────────────────────────────────
create index if not exists watchlists_user_id_idx on public.watchlists(user_id);
create index if not exists watchlists_symbol_idx  on public.watchlists(symbol);

-- ─── Row Level Security ───────────────────────────────────────
alter table public.profiles       enable row level security;
alter table public.watchlists     enable row level security;
alter table public.user_settings  enable row level security;

-- profiles: own row only
create policy "profiles: select own"
  on public.profiles for select
  using ( auth.uid() = id );

create policy "profiles: insert own"
  on public.profiles for insert
  with check ( auth.uid() = id );

create policy "profiles: update own"
  on public.profiles for update
  using ( auth.uid() = id )
  with check ( auth.uid() = id );

-- watchlists: own rows only
create policy "watchlists: select own"
  on public.watchlists for select
  using ( auth.uid() = user_id );

create policy "watchlists: insert own"
  on public.watchlists for insert
  with check ( auth.uid() = user_id );

create policy "watchlists: update own"
  on public.watchlists for update
  using ( auth.uid() = user_id )
  with check ( auth.uid() = user_id );

create policy "watchlists: delete own"
  on public.watchlists for delete
  using ( auth.uid() = user_id );

-- user_settings: own row only
create policy "user_settings: select own"
  on public.user_settings for select
  using ( auth.uid() = user_id );

create policy "user_settings: insert own"
  on public.user_settings for insert
  with check ( auth.uid() = user_id );

create policy "user_settings: update own"
  on public.user_settings for update
  using ( auth.uid() = user_id )
  with check ( auth.uid() = user_id );

-- ─── Auto-create profile on signup ────────────────────────────
-- This trigger fires when a new auth.users row is inserted
-- and creates the corresponding profile row automatically.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, display_name, created_at, updated_at)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'display_name',
    now(),
    now()
  )
  on conflict (id) do nothing;

  insert into public.user_settings (user_id, updated_at)
  values (new.id, now())
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── Updated_at trigger helper ────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

create trigger user_settings_updated_at
  before update on public.user_settings
  for each row execute procedure public.set_updated_at();
