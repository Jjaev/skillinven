import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { ArrowLeft, Bookmark, BookmarkCheck, Star, Eye, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useSavedSkills } from '@/hooks/use-saved-skills';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import { adaptSkill, type RawSkill } from '@/integrations/skills-db/client';
import type { Skill } from '@/lib/skills';
import { ThemeToggle } from '@/components/brand/ThemeToggle';
import { UserMenu } from '@/components/auth/UserMenu';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { formatCount } from '@/lib/format';
import { getLevel } from '@/lib/level';

export const Route = createFileRoute('/my-skills')({
  head: () => ({ meta: [{ title: '내 스킬 — 스킬학교' }, { name: 'robots', content: 'noindex, nofollow' }] }),
  component: MySkillsPage,
});

const SKILL_COLUMNS =
  'id, public_id, source_id, name, name_ko, description_en, description_ko, is_reviewed, github_url, source_repo, source_path, author, stars, compatible_with, category, created_at, updated_at, view_count, upvotes, downvotes, content_ko, content_ko_updated_at, summary_ko, featured, saves';

const CLI_BADGE_STYLES: Record<string, string> = {
  claude: 'bg-[oklch(0.95_0.04_30)] text-[oklch(0.45_0.15_30)]',
  codex: 'bg-[oklch(0.94_0.04_180)] text-[oklch(0.40_0.12_200)]',
  gemini: 'bg-[oklch(0.94_0.05_260)] text-[oklch(0.40_0.16_270)]',
};

function MySkillsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { savedIds, toggleSave } = useSavedSkills();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  const handleLogin = async () => {
    const result = await lovable.auth.signInWithOAuth('google', {
      redirect_uri: window.location.origin + '/my-skills',
    });
    if (result.error) toast.error('로그인에 실패했어요');
  };

  useEffect(() => {
    if (!user || savedIds.size === 0) { setSkills([]); setLoading(false); return; }
    let active = true;
    (async () => {
      setLoading(true);
      const ids = Array.from(savedIds);
      const { data, error } = await supabase
        .from('skills')
        .select(SKILL_COLUMNS)
        .in('id', ids);
      if (!active) return;
      if (error) toast.error('스킬을 불러오지 못했습니다');
      setSkills(((data ?? []) as unknown as RawSkill[]).map(adaptSkill));
      setLoading(false);
    })();
    return () => { active = false; };
  }, [user, savedIds]);

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
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12">
          <Link to="/directory" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-3.5 w-3.5" /> 디렉토리로
          </Link>
          {authLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> 불러오는 중...
            </div>
          ) : !user ? (
            <div className="rounded-[16px] border border-dashed border-border p-10 text-center">
              <Bookmark className="mx-auto h-8 w-8 text-muted-foreground/60" />
              <h1 className="mt-3 text-xl font-bold text-foreground">나의 스킬함</h1>
              <p className="mt-2 text-sm text-muted-foreground">로그인하면 저장한 스킬을 모아볼 수 있어요</p>
              <button onClick={handleLogin} className="mt-4 inline-flex items-center gap-1.5 rounded-[8px] bg-lavender px-4 py-2 text-sm font-semibold text-foreground hover:shadow-md transition-all">
                Google로 로그인
              </button>
            </div>
          ) : (() => {
            const level = getLevel(savedIds.size);
            return (
              <>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold tracking-[-0.02em] text-foreground leading-[1.1]">나의 스킬함</h1>
                <span
                  className="inline-flex items-center gap-1.5 rounded-full border border-lavender/40 bg-lavender/10 px-3 py-1 text-xs font-semibold text-foreground"
                  title={level.next ? `다음 레벨까지 ${level.next - savedIds.size}개` : '최고 레벨!'}
                >
                  <span>{level.emoji}</span>
                  Lv. {level.name}
                  <span className="text-muted-foreground tabular-nums">· {savedIds.size}{level.next ? `/${level.next}` : ''}</span>
                </span>
              </div>
              <p className="mt-2 text-base text-muted-foreground">저장한 스킬을 한눈에 모아봤어요.</p>
              </>
            );
          })()}

          {user && <div className="mt-8">
            {loading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> 불러오는 중...
              </div>
            ) : skills.length === 0 ? (
              <div className="rounded-[16px] border border-dashed border-border p-10 text-center">
                <Bookmark className="mx-auto h-8 w-8 text-muted-foreground/60" />
                <p className="mt-3 text-base text-muted-foreground">아직 저장한 스킬이 없어요. 마음에 드는 스킬을 저장해보세요!</p>
                <Link to="/directory" className="mt-4 inline-flex items-center gap-1.5 rounded-[8px] bg-lavender px-4 py-2 text-sm font-semibold text-foreground hover:shadow-md transition-all">
                  스킬 둘러보기 →
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {skills.map(s => (
                  <div key={s.uuid} className="group p-4 rounded-[16px] border border-border bg-card hover:shadow-lg hover:shadow-lavender/5 hover:-translate-y-0.5 transition-all">
                    <Link to="/request/$requestId" params={{ requestId: s.id }} className="block">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-base font-bold text-foreground line-clamp-2">{s.name}</h3>
                        <button
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); void toggleSave(s.uuid); }}
                          className="text-lavender hover:opacity-70"
                          title="저장 취소"
                        >
                          <BookmarkCheck className="h-4 w-4 fill-lavender" />
                        </button>
                      </div>
                      {s.description_ko && (
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{s.description_ko}</p>
                      )}
                      <div className="mt-3 flex flex-wrap items-center gap-1.5">
                        {s.compatible_with.map(c => (
                          <span key={c} className={`rounded-[6px] px-1.5 py-0.5 text-[10px] font-semibold ${CLI_BADGE_STYLES[c] ?? 'bg-secondary'}`}>
                            {c}
                          </span>
                        ))}
                      </div>
                      <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1"><Star className="h-3 w-3" /> {formatCount(s.stars, '0')}</span>
                        <span className="inline-flex items-center gap-1"><Eye className="h-3 w-3" /> {formatCount(s.view_count, '0')}</span>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>}
        </main>
      </div>
      <Toaster />
    </>
  );
}
