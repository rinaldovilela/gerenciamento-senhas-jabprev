-- Create user_services mapping table
CREATE TABLE IF NOT EXISTS public.user_services (
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (user_id, service_id)
);

-- RLS policies
ALTER TABLE public.user_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read user_services"
  ON public.user_services
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow admins to insert user_services"
  ON public.user_services
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

CREATE POLICY "Allow admins to delete user_services"
  ON public.user_services
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );
