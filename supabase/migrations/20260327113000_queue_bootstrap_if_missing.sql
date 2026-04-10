-- Bootstrap core queue schema if base migration is missing on remote.

-- Enums
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'user_type' AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.user_type AS ENUM ('aposentado', 'pensionista', 'servidor_ativo');
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'ticket_status' AND n.nspname = 'public'
  ) THEN
    CREATE TYPE public.ticket_status AS ENUM ('waiting', 'in_progress', 'completed', 'cancelled', 'no_show');
  END IF;
END $$;

-- Services
CREATE TABLE IF NOT EXISTS public.services (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text NULL,
  icon text NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Tickets
CREATE TABLE IF NOT EXISTS public.tickets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  number integer NULL,
  formatted_number text NULL,
  service_id uuid NULL REFERENCES public.services(id),
  user_type public.user_type NULL,
  status public.ticket_status NOT NULL DEFAULT 'waiting',
  is_priority boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  started_at timestamp with time zone NULL,
  completed_at timestamp with time zone NULL,
  operator_id uuid NULL REFERENCES auth.users(id)
);

-- RLS baseline
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='services' AND policyname='Services are viewable by everyone.'
  ) THEN
    CREATE POLICY "Services are viewable by everyone." ON public.services FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='services' AND policyname='Only service_role can manage services'
  ) THEN
    CREATE POLICY "Only service_role can manage services" ON public.services FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='tickets' AND policyname='Tickets are viewable by everyone.'
  ) THEN
    CREATE POLICY "Tickets are viewable by everyone." ON public.tickets FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='tickets' AND policyname='Users can create their own tickets.'
  ) THEN
    CREATE POLICY "Users can create their own tickets." ON public.tickets FOR INSERT WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='tickets' AND policyname='Authenticated users (operators) can update tickets.'
  ) THEN
    CREATE POLICY "Authenticated users (operators) can update tickets." ON public.tickets FOR UPDATE USING (auth.role() = 'authenticated');
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS tickets_status_idx ON public.tickets(status);
CREATE INDEX IF NOT EXISTS tickets_service_id_idx ON public.tickets(service_id);
