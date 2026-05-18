ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false;
ALTER TABLE public.skills ADD COLUMN IF NOT EXISTS saves integer NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.increment_skill_save(_skill_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.skills SET saves = saves + 1 WHERE id = _skill_id;
END;
$$;