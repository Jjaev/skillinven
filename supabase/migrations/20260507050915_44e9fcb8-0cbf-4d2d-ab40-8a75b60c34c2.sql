CREATE TABLE public.saved_skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, skill_id)
);

CREATE INDEX idx_saved_skills_user ON public.saved_skills(user_id);
CREATE INDEX idx_saved_skills_skill ON public.saved_skills(skill_id);

ALTER TABLE public.saved_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own saved skills"
ON public.saved_skills FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can save skills"
ON public.saved_skills FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave their own skills"
ON public.saved_skills FOR DELETE TO authenticated
USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.sync_skill_saves_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.skills SET saves = saves + 1 WHERE id = NEW.skill_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.skills SET saves = GREATEST(0, saves - 1) WHERE id = OLD.skill_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER saved_skills_count_trigger
AFTER INSERT OR DELETE ON public.saved_skills
FOR EACH ROW EXECUTE FUNCTION public.sync_skill_saves_count();