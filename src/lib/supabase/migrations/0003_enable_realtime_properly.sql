-- Fix Real-time configuration in Supabase
-- This migration ensures that postgres_changes events are properly published

-- Set replica identity to FULL for proper change tracking (needed for complete change records)
alter table public.tickets replica identity full;
alter table public.services replica identity full;

-- Grant proper permissions to anon user for real-time events
grant select on public.tickets to anon;
grant select on public.services to anon;

