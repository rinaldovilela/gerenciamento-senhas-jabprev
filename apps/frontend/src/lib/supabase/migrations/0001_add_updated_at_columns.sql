-- 1. Add updated_at column to services table with automatic trigger
alter table public.services 
add column if not exists updated_at timestamp with time zone not null default now();

-- 2. Add updated_at column to tickets table with automatic trigger
alter table public.tickets 
add column if not exists updated_at timestamp with time zone not null default now();

-- 3. Create function to update updated_at timestamp automatically
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now() at time zone 'UTC';
  return new;
end;
$$ language plpgsql;

-- 4. Create trigger for services table
drop trigger if exists update_services_updated_at on public.services;
create trigger update_services_updated_at before update on public.services
for each row execute function public.update_updated_at_column();

-- 5. Create trigger for tickets table
drop trigger if exists update_tickets_updated_at on public.tickets;
create trigger update_tickets_updated_at before update on public.tickets
for each row execute function public.update_updated_at_column();
