-- Migration: Add is_ouvidoria to services and ouvidoria_classification to tickets
-- Created: 2026-06-12

-- 1. Add column is_ouvidoria to services
ALTER TABLE public.services 
  ADD COLUMN IF NOT EXISTS is_ouvidoria BOOLEAN NOT NULL DEFAULT false;

-- 2. Add column ouvidoria_classification to tickets with check constraint
ALTER TABLE public.tickets 
  ADD COLUMN IF NOT EXISTS ouvidoria_classification text;

-- Add check constraint for classification
ALTER TABLE public.tickets
  DROP CONSTRAINT IF EXISTS check_ouvidoria_classification;

ALTER TABLE public.tickets
  ADD CONSTRAINT check_ouvidoria_classification 
  CHECK (ouvidoria_classification IS NULL OR ouvidoria_classification IN ('informacao', 'reclamacao', 'elogio'));

-- 3. Insert initial data for Ouvidoria service
INSERT INTO public.services (id, name, description, icon, is_ouvidoria) 
VALUES (
  'a1b2c3d4-0007-4e5f-86a7-b8c9d0e1f2a3', 
  'Ouvidoria', 
  'Atendimento da Ouvidoria para registro de informações, reclamações e elogios.', 
  'support_agent', 
  true
)
ON CONFLICT (id) DO UPDATE 
SET 
  is_ouvidoria = true, 
  icon = 'support_agent',
  description = EXCLUDED.description;
