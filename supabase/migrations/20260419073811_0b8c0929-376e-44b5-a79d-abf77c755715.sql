-- Add new columns to feature_requests for skills
ALTER TABLE public.feature_requests
  ADD COLUMN IF NOT EXISTS compatible_with text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS is_korean_exclusive boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS install_command text;

-- Seed 5 starter skills using a system submitter (first existing user, or skip if none)
DO $$
DECLARE
  seed_user uuid;
BEGIN
  SELECT user_id INTO seed_user FROM public.profiles ORDER BY created_at ASC LIMIT 1;

  IF seed_user IS NOT NULL THEN
    INSERT INTO public.feature_requests (title, description, category, status, submitter_id, compatible_with, is_korean_exclusive, install_command)
    VALUES
      ('한국어 문서 요약', '한국어로 작성된 긴 문서를 핵심 요점만 간결하게 요약해주는 스킬입니다. 보고서, 논문, 뉴스 기사 등에 활용할 수 있습니다.', '한국전용', 'Shipped', seed_user, ARRAY['claude'], true, 'claude skill install korean-doc-summary'),
      ('코드 리뷰', 'PR 또는 커밋 단위로 코드 변경 사항을 분석하고 개선점, 버그 가능성, 스타일 이슈를 한국어로 리뷰합니다.', '개발·기술', 'Shipped', seed_user, ARRAY['claude','codex'], false, 'claude skill install code-review'),
      ('Git 커밋 메시지 생성', 'staged 변경 사항을 분석해 Conventional Commits 형식의 한국어 커밋 메시지를 자동 생성합니다.', '개발·기술', 'Shipped', seed_user, ARRAY['claude','codex','gemini'], false, 'ai skill install git-commit-msg'),
      ('회의록 정리', '회의 녹취록이나 메모를 받아 요약, 액션 아이템, 결정 사항을 구조화된 마크다운으로 정리합니다.', '문서·자동화', 'Shipped', seed_user, ARRAY['claude'], false, 'claude skill install meeting-notes'),
      ('블로그 초안 작성', '주제와 키워드를 입력하면 SEO를 고려한 블로그 글 초안을 한국어로 작성해줍니다.', '크리에이티브', 'Shipped', seed_user, ARRAY['claude','gemini'], false, 'ai skill install blog-draft')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;