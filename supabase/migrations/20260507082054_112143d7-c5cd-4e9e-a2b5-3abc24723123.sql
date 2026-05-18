-- Skill comments table
CREATE TABLE public.skill_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_id uuid NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  author_name text NOT NULL,
  content text NOT NULL CHECK (length(content) BETWEEN 1 AND 1000),
  rating smallint CHECK (rating BETWEEN 1 AND 5),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_skill_comments_skill_id ON public.skill_comments(skill_id, created_at DESC);

ALTER TABLE public.skill_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Skill comments are publicly viewable"
  ON public.skill_comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create skill comments"
  ON public.skill_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own skill comments"
  ON public.skill_comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own skill comments"
  ON public.skill_comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_skill_comments_updated_at
  BEFORE UPDATE ON public.skill_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.skill_comments;
ALTER TABLE public.skill_comments REPLICA IDENTITY FULL;