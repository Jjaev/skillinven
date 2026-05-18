
ALTER TABLE public.skills DROP CONSTRAINT IF EXISTS feature_requests_submitter_id_fkey;
ALTER TABLE public.skills ALTER COLUMN submitter_id DROP NOT NULL;
