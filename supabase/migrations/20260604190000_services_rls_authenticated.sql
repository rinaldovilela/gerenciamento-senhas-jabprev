-- Migration: Allow authenticated admin users to manage services
-- The original policy restricted management to service_role only.
-- We add policies for authenticated users to INSERT, UPDATE, and DELETE services.

-- Drop the restrictive service_role-only policy
DROP POLICY IF EXISTS "Only service_role can manage services" ON public.services;

-- Allow authenticated users to insert services
CREATE POLICY "Authenticated users can insert services"
  ON public.services
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update services
CREATE POLICY "Authenticated users can update services"
  ON public.services
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow authenticated users to delete services
CREATE POLICY "Authenticated users can delete services"
  ON public.services
  FOR DELETE
  TO authenticated
  USING (true);
