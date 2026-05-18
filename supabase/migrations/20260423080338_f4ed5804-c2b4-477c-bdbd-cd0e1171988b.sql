
-- Rename feature_requests to skills
ALTER TABLE public.feature_requests RENAME TO skills;

-- Rename compatible_with to cli_type
ALTER TABLE public.skills RENAME COLUMN compatible_with TO cli_type;

-- Add new columns
ALTER TABLE public.skills
  ADD COLUMN IF NOT EXISTS content text,
  ADD COLUMN IF NOT EXISTS author text,
  ADD COLUMN IF NOT EXISTS upvotes integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS downvotes integer NOT NULL DEFAULT 0;

-- Normalize status to live/wip
UPDATE public.skills SET status = 'live' WHERE status NOT IN ('live', 'wip');
ALTER TABLE public.skills ALTER COLUMN status SET DEFAULT 'live';

-- Allow public read (anon + authenticated)
DROP POLICY IF EXISTS "Feature requests are viewable by authenticated users" ON public.skills;
CREATE POLICY "Skills are publicly viewable"
  ON public.skills FOR SELECT
  TO anon, authenticated
  USING (true);

-- Backfill upvotes/downvotes from votes table
UPDATE public.skills s
SET
  upvotes = COALESCE(vc.up_count, 0),
  downvotes = COALESCE(vc.down_count, 0)
FROM (
  SELECT request_id,
    COUNT(*) FILTER (WHERE vote_type = 1) AS up_count,
    COUNT(*) FILTER (WHERE vote_type = -1) AS down_count
  FROM public.votes
  GROUP BY request_id
) vc
WHERE s.id = vc.request_id;

-- Trigger to keep upvotes/downvotes in sync
CREATE OR REPLACE FUNCTION public.sync_skill_vote_counts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_id uuid;
BEGIN
  target_id := COALESCE(NEW.request_id, OLD.request_id);
  UPDATE public.skills s
  SET
    upvotes = (SELECT COUNT(*) FROM public.votes WHERE request_id = target_id AND vote_type = 1),
    downvotes = (SELECT COUNT(*) FROM public.votes WHERE request_id = target_id AND vote_type = -1)
  WHERE s.id = target_id;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS sync_skill_vote_counts_trigger ON public.votes;
CREATE TRIGGER sync_skill_vote_counts_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.votes
FOR EACH ROW EXECUTE FUNCTION public.sync_skill_vote_counts();
