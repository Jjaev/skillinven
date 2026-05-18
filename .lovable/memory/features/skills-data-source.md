---
name: skills-data-source
description: skills 데이터는 외부 read-only Supabase DB에서 읽음. 투표/댓글/auth는 Lovable Cloud 유지
type: feature
---
# Skills Data Source

- **외부 DB**: `https://ivlwdnoaeqlmsfmlxjgd.supabase.co` — 읽기 전용
- **클라이언트**: `src/integrations/skills-db/client.ts` (`skillsDb`, `fetchSkills`, `fetchSkillByPublicId`)
- **외부 스키마**: `source_id, public_id, name, name_ko, description_en, description_ko, is_reviewed, github_url, source_repo, source_path, author, stars, compatible_with, category, updated_at`
- **어댑터**: `adaptSkill()`이 외부 행을 앱의 `Skill` 타입으로 매핑. 라우팅 ID = `public_id`. `name`은 `name_ko` 우선.
- **Lovable Cloud는 유지**: 인증, posts/post_comments, votes 테이블, profiles, user_roles. 단 votes는 더 이상 새 skills와 연결 안 됨(상세 페이지 투표 UI 제거).
- **어드민**: 외부 DB 읽기 전용이므로 스킬 추가/삭제/리뷰토글 비활성화. posts 삭제는 가능.
- **번역**: `translateSkill` 서버함수에서 캐시 비활성화 (외부 DB write 불가) — 매 요청 DeepL 호출.
