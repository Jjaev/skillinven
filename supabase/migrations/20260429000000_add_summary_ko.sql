ALTER TABLE public.skills
  ADD COLUMN IF NOT EXISTS summary_ko jsonb;

COMMENT ON COLUMN public.skills.summary_ko IS
  '{"what":"한 줄 요약","benefits":["장점"],"howto":"사용법","target":"대상","token_cost":"low|medium|high"}';
