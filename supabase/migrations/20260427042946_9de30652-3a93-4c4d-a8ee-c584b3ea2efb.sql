ALTER TABLE public.skills
  ADD COLUMN IF NOT EXISTS content_ko text,
  ADD COLUMN IF NOT EXISTS content_ko_updated_at timestamptz;