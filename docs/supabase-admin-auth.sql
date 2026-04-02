-- Supabase admin credential store for middleware-protected admin login.
-- Run this in Supabase SQL Editor.

create table if not exists public.admin_credentials (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_admin_credentials_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_admin_credentials_updated_at on public.admin_credentials;
create trigger trg_admin_credentials_updated_at
before update on public.admin_credentials
for each row execute function public.set_admin_credentials_updated_at();

alter table public.admin_credentials enable row level security;

-- No client-facing access. Service role (used by server actions) bypasses RLS.
drop policy if exists "deny_all_admin_credentials_select" on public.admin_credentials;
create policy "deny_all_admin_credentials_select"
on public.admin_credentials
for select
to anon, authenticated
using (false);

drop policy if exists "deny_all_admin_credentials_write" on public.admin_credentials;
create policy "deny_all_admin_credentials_write"
on public.admin_credentials
for all
to anon, authenticated
using (false)
with check (false);
