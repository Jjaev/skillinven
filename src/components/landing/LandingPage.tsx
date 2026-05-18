import { useState, useEffect } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import {
  Search,
  ArrowRight,
  Zap,
  BookOpen,
  Shield,
  Star,
  Code2,
  FileText,
  Languages,
  Database,
  TrendingUp,
  Award,
  Briefcase,
  CheckCircle,
  Github,
  ThumbsUp,
  Sparkles,
  Bookmark,
  BookmarkCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import { UpvoteLogo } from '@/components/brand/UpvoteLogo';
import heroIllustration from '@/assets/hero-illustration.svg';
import { ThemeToggle } from '@/components/brand/ThemeToggle';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { RoadmapSection } from '@/components/landing/RoadmapSection';
import { fetchSkills } from '@/integrations/skills-db/client';
import { useSavedSkills } from '@/hooks/use-saved-skills';
import { UserMenu } from '@/components/auth/UserMenu';
import {
  isKoreanContributor,
  isNewSkill,
  SKILL_CLI_LABELS,
  type Skill,
  type SkillCli,
} from '@/lib/skills';

type LandingSkill = Pick<
  Skill,
  'id' | 'uuid' | 'name' | 'description_ko' | 'compatible_with' | 'category' | 'stars' | 'author' | 'upvotes' | 'created_at' | 'featured' | 'saves' | 'summary_ko'
>;

interface Stats {
  skillCount: number;
  contributorCount: number;
}

const CATEGORIES = [
  { name: '개발기술', icon: Code2, description: '코딩, 디버깅, 리팩터링' },
  { name: '문서자동화', icon: FileText, description: '문서, 회의록, 워크플로우' },
  { name: '크리에이티브', icon: Languages, description: '글쓰기, 기획, 아이디어' },
  { name: '데이터', icon: Database, description: '분석, 변환, 시각화' },
] as const;

const CLI_BADGE_STYLES: Record<string, string> = {
  claude: 'bg-[oklch(0.95_0.04_30)] text-[oklch(0.45_0.15_30)]',
  codex: 'bg-[oklch(0.94_0.04_180)] text-[oklch(0.40_0.12_200)]',
  gemini: 'bg-[oklch(0.94_0.05_260)] text-[oklch(0.40_0.16_270)]',
};

const features = [
  {
    icon: Zap,
    title: '한국어 친화적',
    description: '한국어 문서, 한국어 응답에 최적화된 스킬을 우선 노출합니다.',
  },
  {
    icon: BookOpen,
    title: '어떤 AI든 바로 붙여넣기',
    description: 'Claude, Codex, Gemini 중 어떤 AI를 쓰든 복사해서 바로 사용할 수 있습니다.',
  },
  {
    icon: Shield,
    title: '안전한 명령어',
    description: '복사 한 번으로 설치 가능. 검증된 사용자가 등록한 명령어만 노출됩니다.',
  },
  {
    icon: CheckCircle,
    title: '국산스킬 우선',
    description: '한국인이 직접 만들고 검증한 스킬을 우선 노출합니다.',
  },
];

type CardVariant = 'default' | 'stars' | 'votes' | 'featured' | 'new';

function SaveButton({ skill }: { skill: LandingSkill }) {
  const { savedIds, toggleSave } = useSavedSkills();
  const saved = savedIds.has(skill.uuid);
  const [count, setCount] = useState(skill.saves ?? 0);
  const [busy, setBusy] = useState(false);

  const onClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    const wasSaved = saved;
    setCount(c => Math.max(0, c + (wasSaved ? -1 : 1)));
    const res = await toggleSave(skill.uuid);
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
      className={`inline-flex items-center gap-1 rounded-[8px] px-2 py-1 text-xs font-semibold transition-all ${
        saved
          ? 'bg-lavender/20 text-[oklch(0.45_0.12_290)] dark:text-lavender'
          : 'bg-secondary text-muted-foreground hover:bg-lavender/15 hover:text-foreground'
      }`}
    >
      {saved ? <BookmarkCheck className="h-3.5 w-3.5" strokeWidth={2.2} /> : <Bookmark className="h-3.5 w-3.5" strokeWidth={2.2} />}
      <span className="tabular-nums">{count}</span>
    </button>
  );
}

function SkillCard({ skill, variant = 'default' }: { skill: LandingSkill; variant?: CardVariant }) {
  const isNew = variant === 'new' || isNewSkill(skill.created_at);
  return (
    <Link
      to="/request/$requestId"
      params={{ requestId: skill.id }}
      className={`group relative flex flex-col rounded-[16px] border bg-card p-4 transition-all ${
        variant === 'featured'
          ? 'border-amber/40 hover:border-amber hover:shadow-md hover:shadow-amber/10 min-w-[280px] sm:min-w-[320px]'
          : 'border-border hover:border-lavender/50 hover:shadow-md hover:shadow-lavender/5'
      }`}
    >
      <div className="absolute left-3 top-3 flex flex-col gap-1 z-10">
        {isNew && (
          <span className="inline-flex items-center rounded-full bg-emerald-500 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-white shadow-sm">
            NEW
          </span>
        )}
        {variant === 'featured' && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber/90 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-foreground shadow-sm">
            <Sparkles className="h-2.5 w-2.5" strokeWidth={2.5} /> 픽
          </span>
        )}
      </div>

      {isKoreanContributor(skill.author) && (
        <span className="absolute right-3 top-3 inline-flex items-center rounded-full border border-red-200 bg-red-50 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          KR
        </span>
      )}

      <div className={`flex flex-wrap items-center gap-1 mb-3 ${isNew || variant === 'featured' ? 'pl-12' : ''} pr-10`}>
        {skill.compatible_with?.map(cli => (
          <span
            key={cli}
            className={`inline-flex items-center px-2 py-0.5 rounded-[6px] text-[10px] font-semibold uppercase tracking-wide ${
              CLI_BADGE_STYLES[cli] ?? 'bg-secondary text-muted-foreground'
            }`}
          >
            {SKILL_CLI_LABELS[cli as SkillCli] ?? cli}
          </span>
        ))}
      </div>

      <h3 className="text-base font-semibold text-foreground leading-tight mb-1.5 group-hover:text-lavender transition-colors">
        {skill.name}
      </h3>
      <p className="text-sm text-muted-foreground leading-[1.5] mb-4 line-clamp-2">
        {(variant === 'featured' && skill.summary_ko?.what) || skill.description_ko || '설명이 없습니다.'}
      </p>
      {skill.category && (
        <div className="mb-4">
          <span className="inline-flex items-center rounded-[8px] bg-lavender/10 px-2 py-0.5 text-[11px] font-medium text-[oklch(0.45_0.12_290)] dark:text-lavender">
            {skill.category}
          </span>
        </div>
      )}

      {variant === 'stars' && (
        <div className="mb-3 inline-flex items-center gap-1.5 self-start rounded-[10px] bg-amber/15 px-2.5 py-1 text-xs font-semibold text-amber-foreground">
          <Star className="h-3.5 w-3.5 fill-current" strokeWidth={2.5} />
          <span className="tabular-nums">{skill.stars}</span>
          <span className="font-medium opacity-70">stars</span>
        </div>
      )}
      {variant === 'votes' && (
        <div className="mb-3 inline-flex items-baseline gap-1.5 self-start rounded-[10px] bg-lavender/15 px-3 py-1.5">
          <ThumbsUp className="h-4 w-4 self-center text-lavender" strokeWidth={2.5} />
          <span className="text-2xl font-bold tabular-nums text-foreground leading-none">{skill.upvotes}</span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">추천</span>
        </div>
      )}

      <div className="mt-auto flex items-center justify-between pt-3 border-t border-border/60 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <img
            src={`https://github.com/${encodeURIComponent(skill.author)}.png?size=24`}
            alt=""
            loading="lazy"
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/placeholder.svg'; }}
            className="h-6 w-6 shrink-0 rounded-full bg-secondary object-cover"
          />
          <span className="truncate text-sm font-semibold text-foreground">{skill.author}</span>
          <div className="flex items-center gap-1 shrink-0 text-xs text-muted-foreground">
            <Star className="h-3 w-3" />
            <span className="tabular-nums">{skill.stars}</span>
          </div>
        </div>
        <SaveButton skill={skill} />
      </div>
    </Link>
  );
}

function SectionHeader({ icon: Icon, eyebrow, title, action, subtitle, countBadge }: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  eyebrow: string;
  title: string;
  subtitle?: string;
  countBadge?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <p className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-amber-foreground">
          <Icon className="h-3.5 w-3.5 text-amber" strokeWidth={2.5} />
          {eyebrow}
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-[-0.01em] text-foreground">{title}</h2>
          {countBadge && (
            <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
              {countBadge}
            </span>
          )}
        </div>
        {subtitle && <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function HorizontalSkillRow({ skills, variant }: { skills: LandingSkill[]; variant?: CardVariant }) {
  return (
    <div className="-mx-6 sm:-mx-10 px-6 sm:px-10 overflow-x-auto pb-2">
      <div className="flex gap-4 snap-x snap-mandatory">
        {skills.map(skill => (
          <div key={skill.id} className="snap-start shrink-0 w-[280px] sm:w-[320px]">
            <SkillCard skill={skill} variant={variant} />
          </div>
        ))}
      </div>
    </div>
  );
}

function SkillGrid({ skills, variant = 'default' }: { skills: LandingSkill[]; variant?: CardVariant }) {
  if (skills.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[0, 1, 2].map(i => (
          <div key={i} className="h-48 rounded-[16px] border border-border bg-card/40 animate-pulse" />
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {skills.map(skill => (
        <SkillCard key={skill.id} skill={skill} variant={variant} />
      ))}
    </div>
  );
}

type JobTab = 'office' | 'dev' | 'marketer' | 'writer' | 'student';
const JOB_TABS: { id: JobTab; label: string }[] = [
  { id: 'office', label: '직장인' },
  { id: 'dev', label: '개발자' },
  { id: 'marketer', label: '마케터' },
  { id: 'writer', label: '작가' },
  { id: 'student', label: '학생' },
];



export function LandingPage() {
  const [showNav, setShowNav] = useState(false);
  const [trending, setTrending] = useState<LandingSkill[]>([]);
  const [validated, setValidated] = useState<LandingSkill[]>([]);
  const [featured, setFeatured] = useState<LandingSkill[]>([]);
  const [newThisWeek, setNewThisWeek] = useState<LandingSkill[]>([]);
  const [byJob, setByJob] = useState<Record<JobTab, LandingSkill[]>>({
    office: [], dev: [], marketer: [], writer: [], student: [],
  });
  const [activeJob, setActiveJob] = useState<JobTab>('office');
  const [stats, setStats] = useState<Stats>({ skillCount: 0, contributorCount: 0 });
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setShowNav(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const all = await fetchSkills();
        const byStars = [...all].sort((a, b) => b.stars - a.stars);
        const byVotes = [...all].sort((a, b) => b.upvotes - a.upvotes);
        setTrending(byStars.slice(0, 3));
        setValidated((byVotes[0]?.upvotes ? byVotes : byStars).slice(0, 3));

        setFeatured(all.filter(s => s.featured));
        setNewThisWeek(
          [...all]
            .filter(s => isNewSkill(s.created_at))
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        );

        const byCat = (cats: string[]) =>
          byStars.filter(s => s.category && cats.includes(s.category)).slice(0, 3);
        const officeList = byCat(['문서자동화']);
        const devList = byCat(['개발기술']);
        const marketerList = byCat(['문서자동화', '크리에이티브']);
        const writerList = byCat(['크리에이티브', '문서자동화']);
        const fallback = byStars.slice(0, 3);
        const orFallback = (list: LandingSkill[]) => (list.length > 0 ? list : fallback);
        setByJob({
          office: orFallback(officeList),
          dev: orFallback(devList),
          marketer: orFallback(marketerList),
          writer: orFallback(writerList),
          student: fallback,
        });

        const counts: Record<string, number> = {};
        const authors = new Set<string>();
        for (const row of all) {
          if (row.category) counts[row.category] = (counts[row.category] ?? 0) + 1;
          if (row.author) authors.add(row.author);
        }
        setCategoryCounts(counts);
        setStats({ skillCount: all.length, contributorCount: authors.size });
        const latest = all.reduce<string | null>((acc, s) => {
          const t = s.created_at;
          if (!t) return acc;
          if (!acc || new Date(t).getTime() > new Date(acc).getTime()) return t;
          return acc;
        }, null);
        if (latest) {
          const d = new Date(latest);
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const dd = String(d.getDate()).padStart(2, '0');
          setLastUpdated(`${yyyy}-${mm}-${dd}`);
        }
      } catch (e) {
        console.error('Failed to load skills', e);
      }
    };
    load();
  }, []);

  const handleSearchClick = () => {
    navigate({ to: '/directory' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky nav */}
      <nav className={`fixed top-0 left-0 right-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl px-6 py-4 sm:px-8 md:px-12 transition-all duration-300 ${showNav ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}`}>
        <div className="mx-auto flex max-w-6xl h-8 items-center justify-between">
          <UpvoteLogo size="md" variant="light" />
          <div className="flex items-center gap-3">
            <Link to="/community" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
              커뮤니티
            </Link>
            <ThemeToggle />
            <UserMenu compact />
            <Link to="/directory" className="inline-flex items-center gap-1.5 rounded-[10px] bg-lavender px-4 py-1.5 text-sm font-semibold text-foreground hover:shadow-md hover:shadow-lavender/25 transition-all">
              스킬 찾기 <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      <div className={`fixed top-4 right-4 sm:top-5 sm:right-6 z-30 transition-opacity duration-300 ${showNav ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <ThemeToggle />
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-lavender/20 via-[oklch(0.92_0.06_340)]/25 to-transparent dark:from-lavender/10 dark:via-[oklch(0.30_0.08_320)]/15 dark:to-transparent" />
          <div className="absolute -top-[200px] right-[10%] h-[600px] w-[600px] rounded-full bg-lavender/[0.25] blur-[110px]" />
          <div className="absolute -top-[100px] -left-[200px] h-[500px] w-[500px] rounded-full bg-[oklch(0.75_0.18_350)]/[0.18] blur-[90px]" />
          <div className="absolute top-[40%] left-[40%] h-[300px] w-[300px] rounded-full bg-lavender/[0.10] blur-[80px]" />
        </div>
        <div className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: `radial-gradient(circle, var(--foreground) 1px, transparent 1px)`, backgroundSize: '24px 24px' }} />

        <section className="relative">
          <div className="mx-auto max-w-2xl px-6 pt-8 pb-4 sm:pt-12 sm:pb-5 flex flex-col items-center text-center">
            <div className="mb-4">
              <UpvoteLogo size="sm" variant="light" />
            </div>

            <h1 className="text-3xl font-bold leading-[1.12] tracking-[-0.02em] text-foreground sm:text-5xl md:text-[56px]">
              Korea AI 스킬학교
            </h1>

            <p className="mt-4 text-base leading-[1.6] text-muted-foreground sm:text-lg">
              AI 상위 1% 고수들이 시간 아끼는 법,{' '}
              <span className="font-semibold text-foreground">스킬학교에 있습니다.</span>
            </p>

            {/* Code-editor counter box */}
            <div className="mt-6 w-full max-w-sm overflow-hidden rounded-[12px] border border-border bg-[oklch(0.16_0.015_280)] shadow-md text-left">
              <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-1.5">
                <span className="h-2 w-2 rounded-full bg-[#ff5f57]" />
                <span className="h-2 w-2 rounded-full bg-[#febc2e]" />
                <span className="h-2 w-2 rounded-full bg-[#28c840]" />
                <span className="ml-2 font-mono text-[10px] text-white/50">스킬학교.ts</span>
              </div>
              <div className="px-4 py-3 font-mono text-xs leading-relaxed">
                <div className="text-white/70">
                  <span className="text-[oklch(0.78_0.16_290)]">const</span>{' '}
                  <span className="text-white">고수들의_스킬</span>{' '}
                  <span className="text-white/40">=</span>{' '}
                  <span className="text-[oklch(0.85_0.16_70)] text-lg font-bold">"???"</span>
                  <span className="text-white/40">;</span>
                </div>
                <div className="text-white/40 text-[10px] mt-1">
                  <span>// 여기서 확인하세요</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleSearchClick}
              className="group mt-6 inline-flex items-center gap-2 rounded-[12px] bg-lavender px-5 py-3 text-sm font-semibold text-foreground shadow-md shadow-lavender/20 transition-all hover:shadow-lg hover:shadow-lavender/30"
            >
              스킬 둘러보기 <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>

            <p className="mt-5 text-xs sm:text-sm text-muted-foreground">
              <span className="font-semibold text-foreground tabular-nums">{stats.skillCount}</span>개 스킬
              <span className="mx-2 text-border">·</span>
              <span className="font-semibold text-foreground tabular-nums">{stats.contributorCount}</span>명 기여자
              {newThisWeek.length > 0 && (
                <>
                  <span className="mx-2 text-border">·</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">이번 주 {newThisWeek.length}개 추가</span>
                </>
              )}
            </p>
          </div>
        </section>

        {/* SECTION — 사용법 아코디언 */}
        <section className="mx-auto max-w-6xl px-6 sm:px-10 pt-6">
          <Accordion type="single" collapsible>
            <AccordionItem value="howto" className="border-b border-border">
              <AccordionTrigger className="text-sm font-semibold text-foreground hover:no-underline">
                스킬, 어떻게 써요?
              </AccordionTrigger>
              <AccordionContent>
                <ol className="space-y-2.5 text-sm text-muted-foreground pt-1">
                  {[
                    '마음에 드는 스킬 찾기',
                    '복사 버튼 클릭',
                    'Claude / ChatGPT 열고 붙여넣기',
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-lavender/20 text-[11px] font-bold text-[oklch(0.45_0.12_290)]">
                        {i + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
                <Link to="/directory" className="mt-4 inline-block text-xs text-muted-foreground hover:text-lavender transition-colors">
                  Claude Code를 쓴다면 → 개발자 설치 가이드
                </Link>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        {/* SECTION — 편집장 픽 (featured) */}
        {featured.length > 0 && (
          <section className="relative mt-6 py-10 bg-amber/[0.08] border-y border-amber/20">
            <div className="mx-auto max-w-6xl px-6 sm:px-10">
              <SectionHeader
                icon={Sparkles}
                eyebrow="에디터 픽"
                title="편집장 픽"
                subtitle="스킬학교 팀이 직접 검증했어요"
              />
              <HorizontalSkillRow skills={featured} variant="featured" />
            </div>
          </section>
        )}

        {/* SECTION — 이번 주 새로 추가됨 */}
        {newThisWeek.length > 0 && (
          <section className="relative py-10 bg-emerald-500/[0.05] border-b border-emerald-500/15">
            <div className="mx-auto max-w-6xl px-6 sm:px-10">
              <SectionHeader
                icon={Sparkles}
                eyebrow="신규"
                title="이번 주 새로 추가됨"
                countBadge={`${newThisWeek.length}개 추가됨`}
                action={
                  <Link to="/directory" className="group inline-flex items-center gap-1.5 text-sm font-semibold text-lavender hover:text-[oklch(0.50_0.15_290)] transition-colors shrink-0">
                    전체 보기 <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                }
              />
              <SkillGrid skills={newThisWeek.slice(0, 6)} variant="new" />
            </div>
          </section>
        )}

        {/* SECTION A — 많이 저장된 (stars 기준) */}
        <section className="relative mt-6 py-10 bg-amber/[0.06] border-y border-amber/15">
          <div className="mx-auto max-w-6xl px-6 sm:px-10">
            <SectionHeader
              icon={TrendingUp}
              eyebrow="저장"
              title="많이 저장된"
              action={
                <Link to="/directory" className="group inline-flex items-center gap-1.5 text-sm font-semibold text-lavender hover:text-[oklch(0.50_0.15_290)] transition-colors shrink-0">
                  전체 보기 <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              }
            />
            <SkillGrid skills={trending} variant="stars" />
          </div>
        </section>

        {/* SECTION B — 베스트 (votes 기준) */}
        <section className="relative py-10 bg-lavender/[0.06] border-b border-lavender/15">
          <div className="mx-auto max-w-6xl px-6 sm:px-10">
            <SectionHeader
              icon={Award}
              eyebrow="검증"
              title="베스트"
              action={
                <Link to="/directory" className="group inline-flex items-center gap-1.5 text-sm font-semibold text-lavender hover:text-[oklch(0.50_0.15_290)] transition-colors shrink-0">
                  전체 보기 <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              }
            />
            <SkillGrid skills={validated} variant="votes" />
          </div>
        </section>

        <section className="relative py-10 bg-secondary/40 border-b border-border/60">
          <div className="mx-auto max-w-6xl px-6 sm:px-10">
            <SectionHeader icon={Briefcase} eyebrow="직업" title="직업별 추천" />
            <div role="tablist" className="mb-5 inline-flex flex-wrap items-center gap-1 rounded-[12px] border border-border bg-card p-1">
              {JOB_TABS.map(tab => (
                <button key={tab.id} role="tab" aria-selected={activeJob === tab.id} onClick={() => setActiveJob(tab.id)}
                  className={`px-4 py-1.5 text-sm font-semibold rounded-[8px] transition-all ${
                    activeJob === tab.id ? 'bg-lavender text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}>
                  {tab.label}
                </button>
              ))}
            </div>
            <SkillGrid skills={byJob[activeJob]} />
          </div>
        </section>

        <section className="relative py-8">
          <div className="mx-auto max-w-6xl px-6 sm:px-10">
            <div className="mb-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-lavender">탐색</p>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-[-0.01em] text-foreground">카테고리로 찾기</h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {CATEGORIES.map(cat => {
                const count = categoryCounts[cat.name] ?? 0;
                const Icon = cat.icon;
                return (
                  <Link key={cat.name} to="/directory" search={{ category: cat.name }}
                    className="group flex flex-col rounded-[16px] border border-border bg-card p-5 sm:p-6 hover:border-lavender/50 hover:shadow-md hover:shadow-lavender/5 transition-all">
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-[10px] bg-lavender/10 transition-colors group-hover:bg-lavender/20">
                      <Icon className="h-5 w-5 text-lavender" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground mb-1">{cat.name}</h3>
                    <p className="text-xs text-muted-foreground leading-[1.5] mb-4 line-clamp-2">{cat.description}</p>
                    <div className="mt-auto flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground tabular-nums">{count}</span>개 스킬
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-lavender" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section className="relative py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-6 sm:px-10">
            <div className="flex flex-col gap-12 lg:flex-row lg:gap-20">
              <div className="lg:w-80 lg:flex-shrink-0">
                <div className="lg:sticky lg:top-8">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-lavender">특징</p>
                  <h2 className="text-3xl font-bold leading-[1.08] tracking-[-0.01em] text-foreground sm:text-4xl">왜 스킬학교인가요?</h2>
                  <p className="mt-4 text-base leading-[1.6] text-muted-foreground">
                    누구나 AI 스킬을 배우고 바로 적용할 수 있는 곳. 설명 없이 복사해서 바로 됩니다.
                  </p>
                </div>
              </div>
              <div className="flex-1 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {features.map((feature, i) => (
                  <div key={i} className="group rounded-[16px] border border-border p-7 transition-all hover:border-lavender/30 hover:shadow-lg hover:shadow-lavender/5 sm:p-8">
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-[10px] bg-lavender/10 transition-colors group-hover:bg-lavender/15">
                      <feature.icon className="h-5 w-5 text-lavender" />
                    </div>
                    <h3 className="text-base font-semibold tracking-[-0.02em] text-foreground">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-[1.6] text-muted-foreground">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <RoadmapSection />

        <footer className="px-6 py-6 sm:px-10 border-t border-border/50">
          <div className="mx-auto flex max-w-6xl items-center justify-between flex-wrap gap-3">
            <UpvoteLogo size="sm" variant="light" />
            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
              {lastUpdated && (
                <span className="tabular-nums">마지막 업데이트: {lastUpdated}</span>
              )}
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-foreground">
                <Github className="h-3.5 w-3.5" /> GitHub
              </a>
              <span>© {new Date().getFullYear()} 스킬학교</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
