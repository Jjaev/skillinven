
ALTER TABLE public.skills DROP CONSTRAINT IF EXISTS feature_requests_status_check;
ALTER TABLE public.skills ADD CONSTRAINT skills_status_check CHECK (status IN ('live', 'wip'));
