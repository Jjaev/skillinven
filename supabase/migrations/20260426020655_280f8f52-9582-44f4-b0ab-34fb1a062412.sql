ALTER TABLE public.skills
  ADD COLUMN IF NOT EXISTS github_url text,
  ADD COLUMN IF NOT EXISTS source_repo text,
  ADD COLUMN IF NOT EXISTS source_path text;

COMMENT ON COLUMN public.skills.github_url IS 'GitHub URL for the skill repo or file (e.g. https://github.com/owner/repo or https://github.com/owner/repo/tree/main/skills/my-skill)';
COMMENT ON COLUMN public.skills.source_repo IS 'GitHub repo identifier in form owner/repo (e.g. acme/skills)';
COMMENT ON COLUMN public.skills.source_path IS 'Path within the repo to the skill folder (e.g. skills/my-skill). SKILL.md is fetched from this path.';