import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { fetchSkillByPublicId, fetchSimilarSkills } from '@/integrations/skills-db/client';
import { Toaster } from '@/components/ui/sonner';
import {
  ArrowLeft, Loader2, Copy, Check, Github, Download, Star, GitFork,
  Lightbulb, Zap, Users, BarChart2, Eye, Heart,
} from 'lucide-react';
import { ThemeToggle } from '@/components/brand/ThemeToggle';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { fetchSkillMd } from '@/utils/fetch-skill-md.functions';
import { translateSkill } from '@/utils/translate.functions';
import {
  installCommand, SKILL_CLI_LABELS, type Skill, type SkillCli,
} from '@/lib/skills';
import { SkillComments } from '@/components/skill/SkillComments';
import { useSavedSkills } from '@/hooks/use-saved-skills';

export const Route = createFileRoute('/request/$requestId')({
  head: ({ params }) => ({
    meta: [
      { title: `${params.requestId} — AI 스킬 — 스킬학교` },
      { name: 'description', content: `${params.requestId} AI 스킬의 한국어 설명, 사용법, 설치 명령어. Claude · Codex · Gemini 호환.` },
      { property: 'og:title', content: `${params.requestId} — 스킬학교` },
      { property: 'og:description', content: `${params.requestId} AI 스킬을 한국어로 바로 사용하세요.` },
      { property: 'og:url', content: `https://skillschool.vercel.app/request/${params.requestId}` },
      { property: 'og:type', content: 'article' },
    ],
    links: [
      { rel: 'canonical', href: `https://skillschool.vercel.app/request/${params.requestId}` },
    ],
  }),
  component: RequestDetailPage,
});

const CLI_BADGE_STYLES: Record<string, string> = {
  claude: 'bg-[oklch(0.95_0.04_30)] text-[oklch(0.45_0.15_30)]',
  codex: 'bg-[oklch(0.94_0.04_180)] text-[oklch(0.40_0.12_200)]',
  gemini: 'bg-[oklch(0.94_0.05_260)] text-[oklch(0.40_0.16_270)]',
};

function RequestDetailPage() {
  const { requestId } = Route.useParams();
  const navigate = useNavigate();
  const { savedIds, toggleSave } = useSavedSkills();

  const [skill, setSkill] = useState<Skill | null>(null);
  const [similarSkills, setSimilarSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [copiedCmd, setCopiedCmd] = useState(false);
  const [copiedMd, setCopiedMd] = useState(false);

  const [contentTab, setContentTab] = useState<'summary' | 'ko' | 'original'>('summary');

  const [koText, setKoText] = useState<string | null>(null);
  const [koLoading, setKoLoading] = useState(false);
  const [koError, setKoError] = useState<string | null>(null);

  // Load Korean translation lazily when tab opens
  useEffect(() => {
    if (contentTab !== 'ko' || !skill || koText || koLoading) return;
    setKoLoading(true);
    setKoError(null);
    translateSkill({
      data: {
        skillId: skill.id,
        sourceRepo: skill.source_repo,
        sourcePath: skill.source_path,
      },
    })
      .then(res => {
        if (res.ok && res.translated) setKoText(res.translated);
        else setKoError(res.error ?? '번역에 실패했어요');
      })
      .catch(e => setKoError(e instanceof Error ? e.message : '번역에 실패했어요'))
      .finally(() => setKoLoading(false));
  }, [contentTab, skill, koText, koLoading]);

  // Load skill from external skills DB by public_id
  useEffect(() => {
    let cancelled = false;
    fetchSkillByPublicId(requestId)
      .then(s => {
        if (cancelled) return;
        if (!s) setNotFound(true);
        else setSkill(s);
      })
      .catch(() => { if (!cancelled) setNotFound(true); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [requestId]);

  // Increment view count + fetch similar skills
  useEffect(() => {
    if (!skill?.uuid || !skill.category) return;
    let cancelled = false;
    import('@/integrations/supabase/client').then(({ supabase }) => {
      if (cancelled) return;
      supabase.rpc('increment_skill_view', { _skill_id: skill.uuid }).then(() => {});
    });
    fetchSimilarSkills(skill.category, skill.id, 3).then(s => {
      if (!cancelled) setSimilarSkills(s);
    });
    return () => { cancelled = true; };
  }, [skill?.uuid, skill?.category, skill?.id]);


  const handleDownload = async () => {
    if (!skill) return;
    try {
      const res = await fetchSkillMd({ data: { sourceRepo: skill.source_repo, sourcePath: skill.source_path } });
      if (!res.ok || !res.text) throw new Error(res.error ?? '다운로드 실패');
      const blob = new Blob([res.text], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'SKILL.md';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success('다운로드를 시작했습니다');
    } catch {
      toast.error('GitHub에서 파일을 가져오지 못했습니다');
    }
  };

  const handleCopyMd = async () => {
    if (!skill) return;
    try {
      const res = await fetchSkillMd({ data: { sourceRepo: skill.source_repo, sourcePath: skill.source_path } });
      if (!res.ok || !res.text) throw new Error(res.error ?? '복사 실패');
      await navigator.clipboard.writeText(res.text);
      setCopiedMd(true);
      setTimeout(() => setCopiedMd(false), 1500);
    } catch {
      toast.error('내용을 복사하지 못했습니다');
    }
  };

  const handleCopyCmd = async () => {
    if (!skill) return;
    await navigator.clipboard.writeText(installCommand(skill));
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 1500);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound || !skill) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background gap-4">
        <p className="text-muted-foreground">스킬을 찾을 수 없습니다</p>
        <Link to="/" className="text-sm font-medium text-primary hover:underline">홈으로 돌아가기</Link>
      </div>
    );
  }

  const cmd = installCommand(skill);

  return (
    <>
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6 sm:py-8">
          <div className="mb-4 sm:mb-6 flex items-center justify-between">
            <button
              onClick={() => navigate({ to: '/directory' })}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> 디렉토리로 돌아가기
            </button>
            <div className="flex items-center gap-2">
              {(() => {
                const isSaved = skill.uuid ? savedIds.has(skill.uuid) : false;
                return (
                  <button
                    onClick={() => skill.uuid && void toggleSave(skill.uuid)}
                    className={`inline-flex items-center gap-1.5 rounded-[8px] border px-2.5 h-9 text-xs font-semibold transition-colors ${
                      isSaved
                        ? 'border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                        : 'border-border bg-card text-muted-foreground hover:text-foreground'
                    }`}
                    title={isSaved ? '저장 취소' : '스킬함에 저장'}
                  >
                    <Heart className={`h-4 w-4 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
                    <span className="tabular-nums">{skill.saves ?? 0}</span>
                  </button>
                );
              })()}
              <ThemeToggle />
            </div>
          </div>

          {/* Header */}
          <div className="space-y-3 mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-[-0.01em] text-foreground">{skill.name}</h1>
            {skill.description_ko && (
              <p className="text-base text-muted-foreground leading-relaxed">{skill.description_ko}</p>
            )}

            {/* Metadata row */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-1">
              <a
                href={`https://github.com/${skill.author}`}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
              >
                <img
                  src={`https://github.com/${skill.author}.png?size=32`}
                  alt={skill.author}
                  className="h-5 w-5 rounded-full bg-secondary"
                  loading="lazy"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                />
                <span className="font-medium">{skill.author}</span>
              </a>
              <span className="inline-flex items-center gap-1" title="조회수">
                <Eye className="h-3.5 w-3.5" />
                <span className="tabular-nums">{skill.view_count ?? 0}</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <Star className="h-3.5 w-3.5" />
                <span className="tabular-nums">{skill.stars}</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <GitFork className="h-3.5 w-3.5" />
                <span className="tabular-nums">{skill.forks}</span>
              </span>
              {skill.category && (
                <span className="inline-flex items-center rounded-[8px] bg-secondary px-2 py-0.5 font-medium text-secondary-foreground">
                  {skill.category}
                </span>
              )}
              {skill.compatible_with?.map(cli => (
                <span key={cli} className={`inline-flex items-center px-2 py-0.5 rounded-[6px] text-[10px] font-semibold uppercase tracking-wide ${
                  CLI_BADGE_STYLES[cli] ?? 'bg-secondary text-muted-foreground'
                }`}>
                  {SKILL_CLI_LABELS[cli as SkillCli] ?? cli}
                </span>
              ))}
            </div>
          </div>



          {/* Action buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-5">
            <Button variant="outline" className="gap-1.5 min-h-[44px]" onClick={handleDownload}>
              <Download className="h-4 w-4" /> 다운로드
            </Button>
            <Button variant="outline" className="gap-1.5 min-h-[44px]" onClick={handleCopyMd}>
              {copiedMd ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              {copiedMd ? '복사됨!' : 'Claude에 붙여넣기'}
            </Button>
            <Button variant="outline" className="gap-1.5 min-h-[44px]" asChild>
              <a href={skill.github_url} target="_blank" rel="noopener noreferrer">
                <Github className="h-4 w-4" /> GitHub
              </a>
            </Button>
          </div>
          <p className="-mt-3 mb-5 text-xs text-muted-foreground">
            Claude를 열고 붙여넣으면 바로 동작해요.{' '}
            <a href="https://claude.ai" target="_blank" rel="noopener noreferrer" className="font-medium text-lavender hover:underline">
              Claude 열기 →
            </a>
          </p>

          {/* Install command */}
          <div className="space-y-2 mb-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">설치 커맨드</p>
            <div className="flex items-start gap-2 rounded-lg border border-border bg-foreground/95 p-3">
              <code className="flex-1 text-xs font-mono text-background overflow-x-auto whitespace-pre-wrap break-all">
                $ {cmd}
              </code>
              <button
                onClick={handleCopyCmd}
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[6px] text-background/70 hover:bg-background/10 hover:text-background transition-colors"
                title="복사"
              >
                {copiedCmd ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Content tabs: Summary / Original */}
          {(() => {
            const s = (skill.summary_ko ?? null) as null | {
              what?: string; benefits?: string[]; howto?: string;
              target?: string; token_cost?: 'low' | 'medium' | 'high';
            };
            const hasSummary = !!s && !!(s.what || (s.benefits && s.benefits.length) || s.howto || s.target || s.token_cost);
            const activeTab: 'summary' | 'ko' | 'original' = contentTab;
            const tokenLabel = s?.token_cost ? ({ low: '낮음', medium: '보통', high: '높음' }[s.token_cost]) : null;
            const tokenColor = s?.token_cost ? ({ low: 'text-emerald-500', medium: 'text-amber-500', high: 'text-rose-500' }[s.token_cost]) : '';

            const tabBtn = (key: 'summary' | 'ko' | 'original', label: React.ReactNode) => (
              <button
                onClick={() => setContentTab(key)}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-[6px] transition-colors ${
                  activeTab === key ? 'bg-lavender text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {label}
              </button>
            );

            return (
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="inline-flex items-center rounded-[8px] border border-border bg-card p-0.5 text-xs font-semibold">
                    {tabBtn('summary', '요약')}
                    {tabBtn('ko', '한국어')}
                    {tabBtn('original', '원문')}
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-card p-4 sm:p-5">
                  {activeTab === 'summary' ? (!s || !hasSummary) ? (
                    <div className="rounded-[12px] border border-dashed border-border bg-secondary/30 p-6 text-center">
                      <p className="text-sm text-muted-foreground">요약 준비 중입니다</p>
                      <a
                        href={skill.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-lavender hover:underline"
                      >
                        <Github className="h-4 w-4" /> GitHub에서 원본 보기 →
                      </a>
                    </div>
                  ) : (
                    (() => {
                      const howtoSteps = s.howto
                        ? s.howto
                            .split(/\n+/)
                            .map(line => line.replace(/^\s*(?:\d+[.)]|[-*•])\s*/, '').trim())
                            .filter(Boolean)
                        : [];
                      const tokenBadgeColor = s.token_cost
                        ? ({
                            low: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
                            medium: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
                            high: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
                          }[s.token_cost])
                        : '';
                      return (
                        <div className="space-y-5">
                          {/* token_cost badge top-right */}
                          {s.token_cost && (
                            <div className="flex justify-end -mt-1 -mr-1">
                              <span className={`inline-flex items-center gap-1 rounded-[6px] border px-2 py-0.5 text-[11px] font-semibold ${tokenBadgeColor}`}>
                                <BarChart2 className="h-3 w-3" />
                                토큰 소모: {tokenLabel}
                              </span>
                            </div>
                          )}

                          {/* ① what */}
                          {s.what && (
                            <div className="rounded-[12px] border border-lavender/30 bg-lavender/10 p-4">
                              <p className="text-[11px] font-bold uppercase tracking-wide text-[oklch(0.45_0.12_290)] dark:text-lavender mb-1.5">이 스킬은?</p>
                              <p className="text-base font-semibold text-foreground leading-snug">{s.what}</p>
                            </div>
                          )}

                          {/* ② benefits */}
                          {s.benefits && s.benefits.length > 0 && (
                            <div className="flex gap-2.5">
                              <Lightbulb className="h-4 w-4 mt-0.5 shrink-0 text-amber-400" />
                              <div className="flex-1">
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">이런 점이 좋아요</p>
                                <ul className="space-y-1 list-disc list-inside marker:text-muted-foreground">
                                  {s.benefits.map((b, i) => <li key={i} className="text-sm text-foreground leading-relaxed">{b}</li>)}
                                </ul>
                              </div>
                            </div>
                          )}

                          {/* ③ howto */}
                          {s.howto && (
                            <div className="flex gap-2.5">
                              <Zap className="h-4 w-4 mt-0.5 shrink-0 text-lavender" strokeWidth={2.4} />
                              <div className="flex-1">
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">이렇게 써요</p>
                                {howtoSteps.length > 1 ? (
                                  <ol className="space-y-1 list-decimal list-inside marker:text-muted-foreground marker:font-semibold">
                                    {howtoSteps.map((step, i) => (
                                      <li key={i} className="text-sm text-foreground leading-relaxed">{step}</li>
                                    ))}
                                  </ol>
                                ) : (
                                  <p className="text-sm text-foreground leading-relaxed">{s.howto}</p>
                                )}
                              </div>
                            </div>
                          )}

                          {/* ④ target */}
                          {s.target && (
                            <div className="pt-1">
                              <span className="inline-flex items-center gap-1.5 rounded-[6px] bg-sky-500/10 border border-sky-500/20 px-2.5 py-1 text-xs font-medium text-sky-700 dark:text-sky-300">
                                <Users className="h-3 w-3" />
                                추천 대상 · {s.target}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })()
                  ) : activeTab === 'ko' ? (
                    koLoading ? (
                      <div className="flex items-center justify-center py-10 text-muted-foreground gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">번역 중...</span>
                      </div>
                    ) : koError ? (
                      <div className="rounded-[12px] border border-dashed border-border bg-secondary/30 p-6 text-center">
                        <p className="text-sm text-rose-500 mb-3">{koError}</p>
                        <a
                          href={skill.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm font-medium text-lavender hover:underline"
                        >
                          <Github className="h-4 w-4" /> GitHub에서 원문 보기 →
                        </a>
                      </div>
                    ) : koText ? (
                      <article className="prose prose-sm dark:prose-invert max-w-none prose-headings:font-bold prose-pre:bg-foreground/95 prose-pre:text-background prose-code:text-foreground">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{koText}</ReactMarkdown>
                      </article>
                    ) : null
                  ) : (
                    <div className="rounded-[12px] border border-dashed border-border bg-secondary/30 p-6 text-center">
                      <p className="text-sm text-muted-foreground mb-3">원문은 GitHub에서 확인할 수 있어요.</p>
                      <a
                        href={skill.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-[8px] border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:border-lavender/50 transition-colors"
                      >
                        <Github className="h-4 w-4" /> GitHub에서 원문 보기 →
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Similar skills */}
          {similarSkills.length > 0 && (
            <div className="mt-10 space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">비슷한 스킬</h2>
              <div className="grid gap-3 sm:grid-cols-3">
                {similarSkills.map(s => (
                  <Link
                    key={s.id}
                    to="/request/$requestId"
                    params={{ requestId: s.id }}
                    className="block rounded-[12px] border border-border bg-card p-4 hover:border-lavender/50 hover:shadow-sm transition-all"
                  >
                    <p className="font-semibold text-sm text-foreground line-clamp-1">{s.name}</p>
                    {s.description_ko && (
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">{s.description_ko}</p>
                    )}
                    <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span className="inline-flex items-center gap-0.5"><Star className="h-3 w-3" />{s.stars}</span>
                      <span className="inline-flex items-center gap-0.5"><Eye className="h-3 w-3" />{s.view_count ?? 0}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Comments / Reviews */}
          {skill.uuid && <SkillComments skillUuid={skill.uuid} />}
        </div>
      </div>
      <Toaster />
    </>
  );
}
