-- Add view_count column to skills
ALTER TABLE public.skills
ADD COLUMN IF NOT EXISTS view_count integer NOT NULL DEFAULT 0;

-- Create skill_views table
CREATE TABLE IF NOT EXISTS public.skill_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_id uuid NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  viewed_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_skill_views_skill_id ON public.skill_views(skill_id);
CREATE INDEX IF NOT EXISTS idx_skill_views_viewed_at ON public.skill_views(viewed_at DESC);

-- Enable RLS
ALTER TABLE public.skill_views ENABLE ROW LEVEL SECURITY;

-- Anyone (including anonymous) can insert a view record
CREATE POLICY "Anyone can insert skill views"
ON public.skill_views
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Anyone can read view records
CREATE POLICY "Skill views are publicly viewable"
ON public.skill_views
FOR SELECT
TO anon, authenticated
USING (true);

-- RPC to atomically increment view_count
CREATE OR REPLACE FUNCTION public.increment_skill_view(_skill_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.skill_views (skill_id) VALUES (_skill_id);
  UPDATE public.skills SET view_count = view_count + 1 WHERE id = _skill_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_skill_view(uuid) TO anon, authenticated;