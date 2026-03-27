-- JWT auth alignment for MVP
-- Adds essential fields/constraints for backend-authenticated users table.

create table if not exists public.users (
  id uuid not null default gen_random_uuid() primary key,
  auth_id uuid null references auth.users(id),
  name text not null,
  email text not null,
  role text not null default 'operator',
  status text not null default 'active',
  password_hash text null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

alter table public.users
  add column if not exists password_hash text;

alter table public.users
  add column if not exists updated_at timestamp with time zone not null default now();

-- Keep the model simple but safe.
alter table public.users
  alter column role set default 'operator';

alter table public.users
  alter column status set default 'active';

-- Add essential data integrity constraints (idempotent by checking catalog).
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'users_role_check'
  ) then
    alter table public.users
      add constraint users_role_check
      check (role in ('user', 'operator', 'admin', 'manager'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'users_status_check'
  ) then
    alter table public.users
      add constraint users_status_check
      check (status in ('active', 'inactive', 'blocked'));
  end if;
end $$;

-- Ensure email uniqueness for auth lookup.
create unique index if not exists users_email_unique_idx on public.users(email);

-- Helpful index for auth users linking to Supabase auth user id.
create index if not exists users_auth_id_idx on public.users(auth_id);
