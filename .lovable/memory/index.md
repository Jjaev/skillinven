---
name: index
description: Project memory index
type: reference
---
# Project Memory

## Core
- App: 스킬학교 — 한국 AI 스킬 마켓. AI CLI(Claude/Codex/Gemini)용 한국어 스킬 디렉토리.
- Brand: 學 글리프 on lavender; "스킬학교" wordmark. 히어로 헤드라인 "한국 AI 스킬 마켓".
- Stack: React 19, TanStack Start/Query, Tailwind v4, Supabase (Lovable Cloud + 외부 read-only skills DB).
- **Skills 데이터는 외부 DB에서 읽기 전용** (`src/integrations/skills-db/client.ts`). 라우팅 키 = `public_id`. 자세한 내용: features/skills-data-source.
- Lovable Cloud는 auth, posts/comments, profiles, user_roles 용도. votes 테이블은 새 skills와 연결 X (상세페이지 투표 UI 제거됨).
- 어드민: skills 읽기 전용(추가/삭제/리뷰토글 비활성). posts 삭제는 가능.
- 번역: DeepL Free (`api-free.deepl.com`), 캐시 없음, 매 요청 호출.
- 카테고리: 개발기술, 문서자동화, 크리에이티브, 데이터, 기타. 빈 카테고리 클릭 시 "이 카테고리의 스킬을 준비 중입니다" empty state.
- Mobile-first: 44px min touch targets. Border radius 8/12/16. No pill shapes.

## Memories
- [Skills Data Source](mem://features/skills-data-source) — 외부 read-only DB 연결, 어댑터, 어드민 제약
- [Design Aesthetic](mem://style/design-aesthetic) — Superhuman-inspired luxury white canvas with deep purple hero
- [Color Palette](mem://style/color-palette) — Mysteria Purple, Lavender Glow accent, Charcoal Ink, OKLCH reactions
- [Typography](mem://style/typography) — Manrope 460w, compact heading line-height (1.08), airy body (1.5)
- [Background Styling](mem://style/background-styling) — Blurred color meshes (lavender/rose/amber) with subtle 24px dot grid
- [Landing Page Layout](mem://features/landing-page) — Full-width, sticky glass nav, pastel grid, side-by-side hero
- [Voting System](mem://features/voting-system) — (legacy: skills와 더이상 연결 X)
- [Security](mem://tech/security-implementation) — Single-org user_roles table
