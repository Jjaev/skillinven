import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState, useEffect, useMemo } from 'react';
import { zodValidator, fallback } from '@tanstack/zod-adapter';
import { z } from 'zod';
import { fetchSkills } from '@/integrations/skills-db/client';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { Search, Star, Loader2, Sparkles, ArrowLeft, PackageOpen, Eye, Bookmark, BookmarkCheck } from 'lucide-react';
import { ThemeToggle } from '@/components/brand/ThemeToggle';
import { isKoreanContributor, SKILL_CLI_LABELS, type Skill, type SkillCli } from '@/lib/skills';
import { formatCount, formatTokenCost, getSignalBadge } from '@/lib/format';
import { useSavedSkills } from '@/hooks/use-saved-skills';
import { UserMenu } from '@/components/auth/UserMenu';

const directorySearchSchema = z.object({
  category: fallback(z.string().optional(), undefined),
  cli: fallback(z.enum(['claude', 'codex', 'gemini']).optional(), undefined),
  q: fallback(z.string().optional(), undefined),
  cost: fallback(z.enum(['low', 'medium', 'high']).optional(), undefined),
  korean: fallback(z.boolean().optional(), undefined),
  featured: fallback(z.boolean().optional(), undefined),
  sort: fallback(z.enum(['recommended', 'recent', 'stars', 'votes']), 'recommended').default('recommended'),
});

export const Route = createFileRoute('/directory')({
  validateSearch: zodValidator(directorySearchSchema),
  head: () => ({
    meta: [
      { title: '스킬 디렉토리 — 스킬학교' },
      { name: 'description', content: '카테고리·CLI·토큰 비용으로 검색하는 한국어 AI 스킬 디렉토리. Claude · Codex · Gemini 호환 스킬을 한 곳에서 비교하세요.' },
      { property: 'og:title', content: '스킬 디렉토리 — 스킬학교' },
      { property: 'og:description', content: '검증된 한국어 AI 스킬을 카테고리와 CLI별로 둘러보세요.' },
      { property: 'og:url', content: 'https://skillschool.vercel.app/directory' },
      { property: 'og:type', content: 'website' },
    ],
    links: [
      { rel: 'canonical', href: 'https://skillschool.vercel.app/directory' },
    ],
  }),
  component: DirectoryPage,
});

type ListSkill = Pick<
  Skill,
  'id' | 'uuid' | 'name' | 'description_ko' | 'compatible_with' | 'category' | 'author' | 'stars' | 'upvotes' | 'downvotes' | 'view_count' | 'created_at' | 'is_reviewed' | 'summary_ko' | 'saves' | 'featured'
>;

/**
 * 추천 점수 (Reddit "Hot" 알고리즘 변형)
 *  - 순점수 = upvotes - downvotes (반대표 반영)
 *  - 로그 스케일: 좋아요 1→10보다 100→110이 미미하게 가중 (멱등성)
 *  - 시간 감쇠: 45시간마다 점수 1pt 감소 (최신 콘텐츠 자연 노출)
 *  - GitHub stars: log10으로 보조 신뢰도 (압도적 영향 방지)
 *  - view_count: 약하게 가중 (미투표 인기 보정)
 */
function hotScore(s: Pick<ListSkill, 'upvotes' | 'downvotes' | 'stars' | 'view_count' | 'created_at'>): number {
  const net = (s.upvotes ?? 0) - (s.downvotes ?? 0);
  const order = Math.log10(Math.max(Math.abs(net), 1));
  const sign = net > 0 ? 1 : net < 0 ? -1 : 0;
  const ageHours = (Date.now() - new Date(s.created_at).getTime()) / 3_600_000;
  const timeDecay = ageHours / 45;
  const starsBoost = Math.log10((s.stars ?? 0) + 1) * 0.3;
  const viewBoost = Math.log10((s.view_count ?? 0) + 1) * 0.15;
  return sign * order + starsBoost + viewBoost - timeDecay;
}

const CLI_FILTERS: Array<{ value: SkillCli | null; label: string }> = [
  { value: null, label: '전체' },
  { value: 'claude', label: 'Claude' },
  { value: 'codex', label: 'Codex' },
  { value: 'gemini', label: 'Gemini' },
];

const CATEGORY_FILTERS: Array<{ value: string | null; label: string }> = [
  { value: null, label: '전체' },
  { value: '개발기술', label: '개발기술' },
  { value: '문서자동화', label: '문서자동화' },
  { value: '크리에이티브', label: '크리에이티브' },
  { value: '데이터', label: '데이터' },
  { value: '마케팅', label: '마케팅' },
  { value: '생산성', label: '생산성' },
  { value: '비즈니스', label: '비즈니스' },
];

const CLI_BADGE_STYLES: Record<string, string> = {
  claude: 'bg-[oklch(0.95_0.04_30)] text-[oklch(0.45_0.15_30)]',
  codex: 'bg-[oklch(0.94_0.04_180)] text-[oklch(0.40_0.12_200)]',
  gemini: 'bg-[oklch(0.94_0.05_260)] text-[oklch(0.40_0.16_270)]',
};

function SaveAction({ uuid, initial }: { uuid: string; initial: number }) {
  const { savedIds, toggleSave } = useSavedSkills();
  const saved = savedIds.has(uuid);
  const [count, setCount] = useState(initial);
  const [busy, setBusy] = useState(false);
  const onClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    const wasSaved = saved;
    setCount(c => Math.max(0, c + (wasSaved ? -1 : 1)));
    const res = await toggleSave(uuid);
    if (res === 'auth' || (wasSaved && res === 'saved') || (!wasSaved && res === 'unsaved')) {
      setCount(c => Math.max(0, c + (wasSaved ? 1 : -1)));
    }
    setBusy(false);
  };
  return (
    <button
      onClick={onClick}
      aria-pressed={saved}
      title={saved ? '저장됨' : '저장하기'}
      className={`inline-flex items-center gap-1 tabular-nums transition-colors ${
        saved ? 'text-lavender' : 'hover:text-lavender'
      }`}
    >
      {saved
        ? <BookmarkCheck className="h-3.5 w-3.5 fill-lavender" strokeWidth={1.8} />
        : <Bookmark className="h-3.5 w-3.5" strokeWidth={1.8} />}
      {formatCount(count, '0')}
    </button>
  );
}


function DirectoryPage() {
  const searchParams = Route.useSearch();
  const navigate = useNavigate({ from: '/directory' });
  const [skills, setSkills] = useState<ListSkill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.q ?? '');
  const cliFilter = (searchParams.cli ?? null) as SkillCli | null;
  const categoryFilter = searchParams.category ?? null;
  const costFilter = searchParams.cost ?? null;
  const koreanOnly = searchParams.korean ?? false;
  const featuredOnly = searchParams.featured ?? false;
  const sortBy = searchParams.sort;

  const updateSearch = (patch: Record<string, unknown>) =>
    navigate({ search: (prev: Record<string, unknown>) => ({ ...prev, ...patch }) });
  const setCliFilter = (value: SkillCli | null) => updateSearch({ cli: value ?? undefined });
  const setCategoryFilter = (value: string | null) => updateSearch({ category: value ?? undefined });
  const setCostFilter = (value: 'low' | 'medium' | 'high' | null) => updateSearch({ cost: value ?? undefined });
  const toggleKorean = () => updateSearch({ korean: koreanOnly ? undefined : true });
  const toggleFeatured = () => updateSearch({ featured: featuredOnly ? undefined : true });
  const setSortBy = (value: 'recommended' | 'recent' | 'stars' | 'votes') => updateSearch({ sort: value });

  // Sync search input → URL (debounced)
  useEffect(() => {
    const t = setTimeout(() => {
      updateSearch({ q: search.trim() || undefined });
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const data = await fetchSkills();
        if (!active) return;
        setSkills(data as ListSkill[]);
      } catch {
        if (active) toast.error('스킬을 불러오지 못했습니다');
      } finally {
        if (active) setIsLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, []);

  const activeFilterCount =
    (cliFilter ? 1 : 0) + (categoryFilter ? 1 : 0) + (costFilter ? 1 : 0) +
    (koreanOnly ? 1 : 0) + (featuredOnly ? 1 : 0) + (search.trim() ? 1 : 0);

  const resetAll = () => {
    setSearch('');
    navigate({ search: () => ({ sort: 'recommended' }) });
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const result = skills.filter(s => {
      if (q && !s.name.toLowerCase().includes(q) && !(s.description_ko ?? '').toLowerCase().includes(q)) return false;
      if (cliFilter && !s.compatible_with?.includes(cliFilter)) return false;
      if (categoryFilter && s.category !== categoryFilter) return false;
      if (costFilter && s.summary_ko?.token_cost !== costFilter) return false;
      if (koreanOnly && !isKoreanContributor(s.author)) return false;
      if (featuredOnly && !s.featured) return false;
      return true;
    });
    result.sort((a, b) => {
      if (sortBy === 'stars') return b.stars - a.stars;
      if (sortBy === 'votes') return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
      if (sortBy === 'recent') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      return hotScore(b) - hotScore(a);
    });
    return result;
  }, [skills, search, cliFilter, categoryFilter, costFilter, koreanOnly, featuredOnly, sortBy]);

  return (
    <>
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-30 border-b border-border bg-card/85 backdrop-blur-md">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-lavender shadow-sm shadow-lavender/30">
                <span className="text-base font-bold text-white">學</span>
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-bold text-foreground">스킬학교</span>
                <span className="text-[10px] text-muted-foreground">한국 AI 스킬 마켓</span>
              </div>
            </Link>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <UserMenu compact />
              <Link to="/" className="inline-flex items-center gap-1.5 rounded-[10px] px-3 py-1.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
                <ArrowLeft className="h-3.5 w-3.5" /> 홈으로
              </Link>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12">
          <div className="mb-8">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-lavender/15 px-3 py-1 text-xs font-medium text-[oklch(0.45_0.12_290)] mb-4">
              <Sparkles className="h-3 w-3" /> 스킬 디렉토리
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-[-0.02em] text-foreground leading-[1.1]">
              한국어 AI 스킬 둘러보기
            </h1>
            <p className="mt-3 text-base text-muted-foreground max-w-xl">
              Claude, Codex, Gemini에서 바로 복사해 쓸 수 있는 한국어 스킬들을 검색하고 발견하세요.
            </p>
          </div>

          <div className="relative mb-5">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="스킬 이름이나 설명으로 검색…"
              className="w-full h-12 rounded-[14px] border border-border bg-card pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-lavender/40 focus:border-lavender transition-all"
            />
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground mr-1">도구별</span>
              {CLI_FILTERS.map(f => (
                <button key={f.label} onClick={() => setCliFilter(f.value)}
                  className={`px-3 py-1.5 rounded-[10px] text-xs font-medium transition-all ${
                    cliFilter === f.value ? 'bg-foreground text-background' : 'bg-secondary text-muted-foreground hover:bg-secondary/70 hover:text-foreground'
                  }`}>
                  {f.label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground mr-1">카테고리</span>
              {CATEGORY_FILTERS.map(f => {
                const count = f.value === null ? skills.length : skills.filter(s => s.category === f.value).length;
                const disabled = f.value !== null && count === 0;
                const active = categoryFilter === f.value;
                return (
                  <button
                    key={f.label}
                    onClick={() => !disabled && setCategoryFilter(f.value)}
                    disabled={disabled}
                    className={`px-3 py-1.5 rounded-[10px] text-xs font-medium transition-all ${
                      active
                        ? 'bg-lavender text-foreground'
                        : disabled
                        ? 'bg-secondary/40 text-muted-foreground/40 cursor-not-allowed'
                        : 'bg-secondary text-muted-foreground hover:bg-secondary/70 hover:text-foreground'
                    }`}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground mr-1">토큰비용</span>
              {([
                { value: null, label: '전체' },
                { value: 'low' as const, label: '⚡ 가벼움' },
                { value: 'medium' as const, label: '🔋 보통' },
                { value: 'high' as const, label: '💎 고급' },
              ]).map(f => {
                const active = costFilter === f.value;
                return (
                  <button key={f.label} onClick={() => setCostFilter(f.value)}
                    className={`px-3 py-1.5 rounded-[10px] text-xs font-medium transition-all ${
                      active ? 'bg-foreground text-background' : 'bg-secondary text-muted-foreground hover:bg-secondary/70 hover:text-foreground'
                    }`}>
                    {f.label}
                  </button>
                );
              })}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground mr-1">빠른 필터</span>
              <button onClick={toggleKorean}
                className={`px-3 py-1.5 rounded-[10px] text-xs font-medium transition-all ${
                  koreanOnly ? 'bg-amber/30 text-amber-foreground' : 'bg-secondary text-muted-foreground hover:bg-secondary/70 hover:text-foreground'
                }`}>
                🇰🇷 국산만
              </button>
              <button onClick={toggleFeatured}
                className={`px-3 py-1.5 rounded-[10px] text-xs font-medium transition-all ${
                  featuredOnly ? 'bg-lavender text-foreground' : 'bg-secondary text-muted-foreground hover:bg-secondary/70 hover:text-foreground'
                }`}>
                ✨ 편집장 픽
              </button>
              {activeFilterCount > 0 && (
                <button onClick={resetAll}
                  className="ml-auto px-3 py-1.5 rounded-[10px] text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/70 transition-all">
                  필터 초기화 ({activeFilterCount})
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between mb-5">
            <span className="text-sm text-muted-foreground">{filtered.length}개의 스킬</span>
            <div className="inline-flex rounded-[10px] bg-secondary p-1">
              {([
                { id: 'recommended', label: '추천' },
                { id: 'votes', label: '인기' },
                { id: 'stars', label: '저장순' },
                { id: 'recent', label: '최신' },
              ] as const).map(opt => (
                <button key={opt.id} onClick={() => setSortBy(opt.id)}
                  className={`px-3 py-1.5 rounded-[8px] text-xs font-medium transition-all ${
                    sortBy === opt.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
                  }`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-6 w-6 animate-spin text-lavender" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-24">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-[16px] bg-lavender/10">
                <PackageOpen className="h-8 w-8 text-lavender" strokeWidth={1.8} />
              </div>
              {categoryFilter ? (
                <>
                  <p className="text-base font-semibold text-foreground">이 카테고리의 스킬을 준비 중입니다.</p>
                  <p className="mt-1.5 text-sm text-muted-foreground">곧 새로운 스킬이 등록될 예정이에요.</p>
                  <button
                    onClick={() => setCategoryFilter(null)}
                    className="mt-5 inline-flex items-center gap-1.5 rounded-[10px] bg-lavender px-4 py-2 text-sm font-semibold text-foreground hover:shadow-md hover:shadow-lavender/25 transition-all"
                  >
                    전체 스킬 보기
                  </button>
                </>
              ) : (
                <p className="text-muted-foreground">조건에 맞는 스킬이 없습니다.</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(skill => {
                const signal = getSignalBadge(skill);
                const cost = formatTokenCost(skill.summary_ko?.token_cost);
                const isKorean = isKoreanContributor(skill.author);
                return (
                  <Link
                    key={skill.id}
                    to="/request/$requestId"
                    params={{ requestId: skill.id }}
                    className="group relative flex flex-col rounded-[16px] border border-border bg-card p-4 hover:border-lavender/50 hover:shadow-md hover:shadow-lavender/5 hover:-translate-y-0.5 transition-all duration-200"
                  >
                    {/* Top row: signal badge (left) + 국산 badge (right) */}
                    <div className="flex items-start justify-between mb-3 min-h-[20px]">
                      {signal ? (
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide ${signal.className}`}
                          title={signal.label}
                        >
                          <span aria-hidden>{signal.emoji}</span>
                          {signal.label}
                        </span>
                      ) : <span />}
                      {isKorean && (
                        <span className="inline-flex items-center gap-0.5 rounded-full bg-amber/15 px-2 py-0.5 text-[10px] font-semibold text-amber-foreground" title="국산스킬">
                          🇰🇷 국산
                        </span>
                      )}
                    </div>

                    {/* CLI compatibility */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {skill.compatible_with?.map(cli => (
                        <span key={cli} className={`inline-flex items-center px-2 py-0.5 rounded-[6px] text-[10px] font-semibold uppercase tracking-wide ${
                          CLI_BADGE_STYLES[cli] ?? 'bg-secondary text-muted-foreground'
                        }`}>
                          {SKILL_CLI_LABELS[cli as SkillCli] ?? cli}
                        </span>
                      ))}
                    </div>

                    {/* Title + description */}
                    <h3 className="text-base font-semibold text-foreground leading-tight mb-1.5">{skill.name}</h3>
                    <p className="text-sm text-muted-foreground leading-[1.5] mb-3 line-clamp-2">
                      {skill.description_ko ?? '설명이 없습니다.'}
                    </p>

                    {/* Meta row: cost · category */}
                    {(cost || skill.category) && (
                      <div className="flex items-center gap-2 mb-4 text-[11px] text-muted-foreground flex-wrap">
                        {cost && (
                          <span className="inline-flex items-center gap-1 font-medium">
                            <span aria-hidden>{cost.icon}</span>{cost.label}
                          </span>
                        )}
                        {cost && skill.category && <span className="text-border">·</span>}
                        {skill.category && (
                          <span className="inline-flex items-center rounded-[6px] bg-lavender/10 px-1.5 py-0.5 font-medium text-[oklch(0.45_0.12_290)]">
                            {skill.category}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Metrics footer */}
                    <div className="mt-auto flex items-center justify-between pt-3 border-t border-border/60">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1 tabular-nums" title="조회수">
                          <Eye className="h-3.5 w-3.5" strokeWidth={1.8} />
                          {formatCount(skill.view_count, '신규')}
                        </span>
                        <SaveAction uuid={skill.uuid} initial={skill.saves ?? 0} />
                        <span className="inline-flex items-center gap-1 tabular-nums" title="GitHub stars">
                          <Star className="h-3.5 w-3.5" strokeWidth={1.8} />
                          {formatCount(skill.stars, '0')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 min-w-0">
                        <img
                          src={`https://github.com/${encodeURIComponent(skill.author)}.png?size=24`}
                          alt=""
                          loading="lazy"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/placeholder.svg'; }}
                          className="h-6 w-6 shrink-0 rounded-full bg-secondary object-cover"
                        />
                        <span className="truncate text-sm font-semibold text-foreground max-w-[100px]" title={skill.author}>
                          {skill.author}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </main>
      </div>
      <Toaster />
    </>
  );
}
