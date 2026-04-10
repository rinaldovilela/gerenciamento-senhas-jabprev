-- Temporary policy for mock-auth flow (no Supabase Auth session in frontend)
-- IMPORTANT: replace this when migrating to Supabase Auth JWT-based login.

drop policy if exists "Authenticated users can update tickets" on public.tickets;
drop policy if exists "Authenticated users (operators) can update tickets." on public.tickets;

create policy "Public clients can update tickets (temporary)"
  on public.tickets
  for update
  using (true)
  with check (true);
