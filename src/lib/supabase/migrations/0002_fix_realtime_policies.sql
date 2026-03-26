-- Fix RLS policies to allow real-time events to be delivered properly

-- Drop existing restrictive policies
drop policy if exists "Authenticated users (operators) can update tickets." on public.tickets;

-- Create more permissive policy for updates (authenticated users can update any ticket)
create policy "Authenticated users can update tickets" on public.tickets 
    for update 
    using (auth.role() = 'authenticated') 
    with check (auth.role() = 'authenticated');

-- Ensure services have proper policy
drop policy if exists "Only service_role can manage services" on public.services;
create policy "Service admins can manage services" on public.services 
    for all 
    using (auth.role() = 'service_role') 
    with check (auth.role() = 'service_role');

