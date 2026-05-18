
# 카드 심리 설계 — 클릭하고 싶게 만드는 스킬 카드

## 현재 문제

- 카드에 표시되는 시그널이 **별점·작성자·CLI 뱃지**뿐 — 사용자에게 "이걸 왜 봐야 하는지" 동기 부여가 약함
- DB 상태: `view_count`·`upvotes` 거의 0 (콜드스타트). 숫자만 그대로 노출하면 "아무도 안 본 스킬"처럼 보여 오히려 역효과
- 카테고리/CLI 뱃지가 시각적으로 비슷한 무게라 위계가 없음

## 설계 원칙 — 5가지 심리 트리거

1. **사회적 증거(Social Proof)** — "남들도 쓴다"
2. **신선도(Recency/FOMO)** — "방금 올라왔다 / 이번 주에 떴다"
3. **희소성·차별성(Scarcity)** — "국산", "에디터 픽", "Top 10"
4. **호기심 갭(Curiosity Gap)** — 한 줄 설명 + 비용·난이도 한눈에
5. **신뢰 시그널(Trust)** — 검수 여부, GitHub stars 컨텍스트화

---

## 카드에 추가할 요소

### A. 좌상단 — **시그널 뱃지 (한 개만 노출, 우선순위 적용)**

상황별로 가장 강한 한 가지만 보여주기 (시각 노이즈 최소화):

| 우선순위 | 뱃지 | 조건 | 색감 |
|---|---|---|---|
| 1 | `🔥 HOT` | 최근 7일 hotScore 상위 10% | 코랄 |
| 2 | `🆕 NEW` | 생성 7일 이내 | 라벤더 |
| 3 | `✨ 에디터 픽` | `is_reviewed = true` | 앰버 |
| 4 | `📈 급상승` | 최근 3일 view 증가율 상위 | 민트 |
| 5 | (없음) | — | — |

→ 우상단의 `🇰🇷 국산` 뱃지는 그대로 유지 (성격 다름 — 정체성 시그널).

### B. 카드 본문 하단 메트릭 행 — **3개 슬롯 통일**

현재: `작성자 · ⭐ stars` 뿐  
변경: 좌측에 **3개 메트릭**, 우측에 **저장 아이콘(🔖)**

```text
👁 1.2k    🔖 84    ⭐ 4.3k          [🔖]
조회      저장     GitHub          저장 토글
```

- **조회수 포맷팅**: `1234 → 1.2k`, `0 → "신규"` (0을 그대로 안 보여줌 — 콜드스타트 회피)
- **저장수**: `upvotes`를 "👍"가 아니라 "🔖 저장"으로 리프레이밍 — 행동 동사가 가입 욕구 자극 ("나도 저장해두자")
- **GitHub stars**: 외부 신뢰도. 콤마 포맷 (`4,328` → `4.3k`)
- **0인 경우**: 숫자 대신 옅은 회색 `–` 처리하거나 "신규" 라벨

### C. 설명 위 — **메타 한 줄 (호기심 + 비용 정보)**

`summary_ko.token_cost`(low/medium/high)를 활용:

```text
⚡ 가벼움 · 5분 적용     (low)
🔋 보통 · 토큰 적당     (medium)  
💎 고급 · 토큰 많이 씀  (high)
```

→ 사용자가 "써볼지 말지" 즉시 결정할 수 있게 함. 토큰 비용은 Claude/Codex 사용자에게 가장 큰 의사결정 요인.

### D. 호버 인터랙션 — **마이크로 보상**

- 카드 hover 시 부드러운 lift (현재 있음, 강화)
- `🔖 저장` 아이콘이 살짝 흔들리는 애니메이션 → "눌러봐" 신호
- 카드 우측 가장자리에 1px 라벤더 액센트 라인 슬라이드 인

### E. 카테고리 뱃지 위치 변경

현재 본문 중앙에 떠있어서 시각 위계 깨짐 → **메타 한 줄 옆으로 이동**, 작은 회색 텍스트로 다운그레이드 ("개발기술" 같은 카테고리는 보조 정보).

---

## 최종 카드 레이아웃

```text
┌─────────────────────────────────────┐
│ 🔥 HOT                     🇰🇷 국산 │  ← 시그널 뱃지 (1개만)
│                                     │
│ Claude  Codex                       │  ← CLI 뱃지 (소형, 위계 낮춤)
│                                     │
│ UI/UX Pro Max                       │  ← 제목 (큼, 굵게)
│ 디자인 시스템부터 컴포넌트까지       │  ← 설명 (2줄 클램프)
│ 한 번에 만들어주는 시니어 디자이너   │
│                                     │
│ ⚡ 가벼움 · 5분 적용  · 개발기술    │  ← 메타 한 줄 (비용+카테고리)
│                                     │
│ ─────────────────────────────────── │
│ 👁 1.2k  🔖 84  ⭐ 4.3k    by alice │  ← 메트릭 + 작성자
└─────────────────────────────────────┘
```

---

## 추가 — 디렉토리 상단 "사회적 증거 스트립" (선택)

검색바 아래에 한 줄 추가:

```text
📊 이번 주 가장 많이 저장된 스킬: superpowers · ui-ux-pro-max · caveman
```

- 콜드스타트 시기에는 "최근 등록된 스킬: ..."로 폴백
- 클릭 시 해당 스킬로 이동
- 호기심 + FOMO 동시 자극

---

## 기술 변경 요약

### 파일
- `src/routes/directory.tsx`: 카드 JSX 재설계, 포맷팅 헬퍼 추가
- `src/lib/format.ts` (신규): `formatCount(n)`, `formatTokenCost(level)`, `getSignalBadge(skill)` 헬퍼

### 헬퍼 시그니처

```typescript
// 1.2k, 4.3k, "신규" 변환
formatCount(n: number, fallback?: string): string

// low/medium/high → { icon, label, tone }
formatTokenCost(level?: 'low'|'medium'|'high'): { icon, label } | null

// HOT/NEW/픽/급상승 중 1개 (우선순위 적용)
getSignalBadge(skill): { label, emoji, className } | null
```

### `getSignalBadge` 로직

```typescript
const ageDays = (Date.now() - new Date(s.created_at).getTime()) / 86_400_000;
const score = hotScore(s); // 기존 함수 재사용

if (score > HOT_THRESHOLD && ageDays < 14) return { label: 'HOT', emoji: '🔥' };
if (ageDays < 7) return { label: 'NEW', emoji: '🆕' };
if (s.is_reviewed) return { label: '에디터 픽', emoji: '✨' };
return null;
```

`is_reviewed`·`view_count`·`created_at`은 이미 `ListSkill` 타입에 있음(또는 추가 필요 — `is_reviewed` 추가).

### 데이터 변경 — **없음**
스키마는 그대로. 모든 시그널은 기존 컬럼에서 파생.

---

## 비파괴 원칙

- 현재 hotScore 알고리즘·정렬 옵션 그대로 유지
- 색상 토큰 (lavender, amber 등) 그대로 사용 — 새 색 도입 없음
- 카드 클릭 동작·라우팅 그대로

승인하시면 `src/lib/format.ts` 신규 + `src/routes/directory.tsx` 카드 부분 재작성으로 구현하겠습니다.
