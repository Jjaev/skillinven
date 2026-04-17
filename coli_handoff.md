# coli 시작 가이드

> 욱님이 coli에게 그대로 전달하는 문서

---

## 미션

한국 Claude Code Skills 마켓플레이스 **스킬인벤** 구축.
GitHub에서 SKILL.md 가져와서 한국어로 보여주는 사이트.

---

## 스펙 위치

모든 스펙은 이 폴더에 있어:
```
01_Projects/Pjt_진행중_Skills 마켓 만들기/coli_spec/
```

읽는 순서:
1. `00_overview.md` — 프로젝트 개요 + 협업 구조
2. `01_기능.md` — MVP 기능 목록 (P0/P1 우선순위)
3. `02_기술스택.md` — Next.js 15 + Supabase + Vercel + 환경변수
4. `03_데이터.md` — 스키마 + 초기 데이터 입력 방식
5. `04_UI.md` — 페이지 구조 + 레이아웃
6. `05_레퍼런스.md` — UI 기준점 + 레이어별 레퍼런스

---

## UI 기준점

**Notion Template Gallery** 구조로 시작.
- 카드 그리드 + 카테고리 + 상세 페이지
- URL: https://www.notion.so/templates

포켓몬 도감 세계관은 MVP 이후에 얹음. 지금은 노션 구조만.

---

## 첫 번째 할 것

1. `coli_spec/` 전체 읽기
2. `anthropics/skills` GitHub 레포 실제 존재 확인
   - 있으면 → 공식 스킬 파싱해서 초기 데이터 구성
   - 없으면 → 수동 입력 방식으로 전환 후 욱님에게 보고
3. Next.js 15 프로젝트 세팅
4. Supabase 스키마 생성 (`03_데이터.md` 기준)
5. 홈 페이지 (카드 그리드) 먼저

---

## 협업 방식

- 한 번에 완성 X — 결과물 보면서 같이 다듬는 방식
- 막히거나 결정 필요한 것 → 욱님에게 바로 보고
- 뉴턴이 결과물 크로스체크함 (욱님이 중간에 공유)

---

## 배포 목표

`skillinven.vercel.app` (Vercel 무료)
