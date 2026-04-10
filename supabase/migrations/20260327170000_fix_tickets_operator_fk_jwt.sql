-- Align tickets.operator_id with JWT users table (public.users).
-- This migration is defensive and safe for mixed legacy environments.

DO $$
BEGIN
  -- If operator_id still references auth.users, clean invalid values before switching FK.
  IF EXISTS (
    SELECT 1
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
     AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage ccu
      ON ccu.constraint_name = tc.constraint_name
     AND ccu.table_schema = tc.table_schema
    WHERE tc.table_schema = 'public'
      AND tc.table_name = 'tickets'
      AND tc.constraint_type = 'FOREIGN KEY'
      AND kcu.column_name = 'operator_id'
      AND ccu.table_schema = 'auth'
      AND ccu.table_name = 'users'
  ) THEN
    UPDATE public.tickets t
    SET operator_id = NULL
    WHERE operator_id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1
        FROM auth.users au
        WHERE au.id = t.operator_id
      );
  END IF;
END $$;

ALTER TABLE public.tickets
  DROP CONSTRAINT IF EXISTS tickets_operator_id_fkey;

-- Ensure legacy rows are compatible with the new FK target.
UPDATE public.tickets t
SET operator_id = NULL
WHERE operator_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM public.users u
    WHERE u.id = t.operator_id
  );

ALTER TABLE public.tickets
  ADD CONSTRAINT tickets_operator_id_fkey
  FOREIGN KEY (operator_id)
  REFERENCES public.users(id)
  ON DELETE SET NULL;
