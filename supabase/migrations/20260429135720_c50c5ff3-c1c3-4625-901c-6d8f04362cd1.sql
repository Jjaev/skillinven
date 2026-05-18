-- Add new columns to skills for external schema compatibility
ALTER TABLE public.skills
  ADD COLUMN IF NOT EXISTS public_id text,
  ADD COLUMN IF NOT EXISTS source_id text,
  ADD COLUMN IF NOT EXISTS name_ko text;

-- Allow stars to be null (external data has nulls)
ALTER TABLE public.skills ALTER COLUMN stars DROP NOT NULL;

-- Unique index on public_id for lookup
CREATE UNIQUE INDEX IF NOT EXISTS skills_public_id_key ON public.skills(public_id);
CREATE UNIQUE INDEX IF NOT EXISTS skills_source_id_key ON public.skills(source_id);
CREATE INDEX IF NOT EXISTS skills_category_idx ON public.skills(category);