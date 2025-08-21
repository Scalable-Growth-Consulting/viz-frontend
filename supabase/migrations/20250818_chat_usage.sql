-- Create chat_usage table to track per-user daily chat usage
create table if not exists public.chat_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  used_count integer not null default 0,
  last_reset timestamptz not null default now(),
  inserted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Helpful index
create index if not exists chat_usage_user_id_idx on public.chat_usage(user_id);

-- Updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end; $$;

drop trigger if exists set_chat_usage_updated_at on public.chat_usage;
create trigger set_chat_usage_updated_at
before update on public.chat_usage
for each row execute procedure public.set_updated_at();

-- Enable RLS and add minimal policies
alter table public.chat_usage enable row level security;

-- Allow users to select their own usage row
create policy if not exists "Allow user select own usage"
  on public.chat_usage for select
  using (auth.uid() = user_id);

-- Allow users to insert their own row (optional; backend uses service role)
create policy if not exists "Allow user insert own usage"
  on public.chat_usage for insert
  with check (auth.uid() = user_id);

-- Allow users to update their own row (optional; backend uses service role)
create policy if not exists "Allow user update own usage"
  on public.chat_usage for update
  using (auth.uid() = user_id);

-- Daily reset job using pg_cron (runs at 00:05 UTC). If pg_cron is unavailable, this will no-op.
-- Resets counters older than 1 day; backend also performs rolling 24h reset check.
DO $$
BEGIN
  PERFORM cron.schedule(
    job_name => 'reset_chat_usage_daily',
    schedule => '5 0 * * *',
    command => $$update public.chat_usage set used_count = 0, last_reset = now() where last_reset < now() - interval '1 day';$$
  );
EXCEPTION WHEN undefined_function OR invalid_schema_name OR undefined_table THEN
  -- pg_cron not available; ignore
  NULL;
END$$;
