-- Drop dependent objects
DROP TABLE IF EXISTS public.skill_views CASCADE;
DROP TABLE IF EXISTS public.comments CASCADE;
DROP TABLE IF EXISTS public.votes CASCADE;
DROP FUNCTION IF EXISTS public.increment_skill_view(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.sync_skill_vote_counts() CASCADE;
DROP FUNCTION IF EXISTS public.get_vote_counts() CASCADE;
DROP TABLE IF EXISTS public.skills CASCADE;

-- Recreate skills with new schema
CREATE TABLE public.skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description_ko text,
  description_en text,
  github_url text NOT NULL,
  source_repo text NOT NULL,
  source_path text NOT NULL,
  author text NOT NULL,
  stars integer NOT NULL DEFAULT 0,
  forks integer NOT NULL DEFAULT 0,
  compatible_with text[] NOT NULL DEFAULT '{}',
  category text,
  is_reviewed boolean NOT NULL DEFAULT false,
  upvotes integer NOT NULL DEFAULT 0,
  downvotes integer NOT NULL DEFAULT 0,
  view_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Skills are publicly viewable" ON public.skills
  FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert skills" ON public.skills
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update skills" ON public.skills
  FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete skills" ON public.skills
  FOR DELETE TO authenticated USING (true);

CREATE TRIGGER update_skills_updated_at
  BEFORE UPDATE ON public.skills
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Recreate votes pointing at new skills.id (keep request_id column name to limit rewrites)
CREATE TABLE public.votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  vote_type smallint NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, request_id)
);

ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view all votes" ON public.votes
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert their own votes" ON public.votes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own votes" ON public.votes
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own votes" ON public.votes
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Vote counts function
CREATE OR REPLACE FUNCTION public.get_vote_counts()
RETURNS TABLE(request_id uuid, up_count bigint, down_count bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    v.request_id,
    COUNT(*) FILTER (WHERE v.vote_type = 1) AS up_count,
    COUNT(*) FILTER (WHERE v.vote_type = -1) AS down_count
  FROM public.votes v
  GROUP BY v.request_id;
$$;

-- Sync vote counts trigger
CREATE OR REPLACE FUNCTION public.sync_skill_vote_counts()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE target_id uuid;
BEGIN
  target_id := COALESCE(NEW.request_id, OLD.request_id);
  UPDATE public.skills s SET
    upvotes = (SELECT COUNT(*) FROM public.votes WHERE request_id = target_id AND vote_type = 1),
    downvotes = (SELECT COUNT(*) FROM public.votes WHERE request_id = target_id AND vote_type = -1)
  WHERE s.id = target_id;
  RETURN NULL;
END;
$$;

CREATE TRIGGER votes_sync_counts
  AFTER INSERT OR UPDATE OR DELETE ON public.votes
  FOR EACH ROW EXECUTE FUNCTION public.sync_skill_vote_counts();

-- Increment view function (write directly to view_count)
CREATE OR REPLACE FUNCTION public.increment_skill_view(_skill_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.skills SET view_count = view_count + 1 WHERE id = _skill_id;
END;
$$;

-- Seed initial 4 skills
INSERT INTO public.skills (name, description_ko, github_url, source_repo, source_path, author, category, compatible_with, is_reviewed)
VALUES
  ('PR 코드 리뷰',
   '머지 전 PR을 분석해 SQL 안전성, LLM 신뢰 경계 위반, 구조적 문제를 잡는다',
   'https://github.com/garrytan/gstack/tree/main/review',
   'garrytan/gstack', 'review/SKILL.md', 'Garry Tan', '개발기술', ARRAY['claude'], true),
  ('웹앱 QA 테스트 자동화',
   '웹앱을 체계적으로 테스트하고 버그를 자동으로 찾아 수정한다',
   'https://github.com/garrytan/gstack/tree/main/qa',
   'garrytan/gstack', 'qa/SKILL.md', 'Garry Tan', '개발기술', ARRAY['claude'], true),
  ('보안 감사 CSO 모드',
   'OWASP Top 10, STRIDE 위협 모델링, 공급망 보안까지 인프라 전체를 감사한다',
   'https://github.com/garrytan/gstack/tree/main/cso',
   'garrytan/gstack', 'cso/SKILL.md', 'Garry Tan', '개발기술', ARRAY['claude'], true),
  ('체계적 디버깅 근본원인 분석',
   '조사→분석→가설→구현 4단계로 근본 원인 없이는 수정하지 않는다',
   'https://github.com/garrytan/gstack/tree/main/investigate',
   'garrytan/gstack', 'investigate/SKILL.md', 'Garry Tan', '개발기술', ARRAY['claude'], true);
