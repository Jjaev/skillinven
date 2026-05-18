import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { fetchSkills } from '@/integrations/skills-db/client';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  SKILL_CATEGORIES, SKILL_CLIS, SKILL_CLI_LABELS, type SkillCli,
} from '@/lib/skills';
import {
  Eye, ThumbsUp, Trash2, Loader2, BarChart3, Layers, Heart, ArrowUpDown, Plus,
  MessageSquare, Star, CheckCircle2, Circle, Sparkles,
} from 'lucide-react';

export const Route = createFileRoute('/admin')({
  head: () => ({ meta: [{ title: '관리자 — 스킬학교' }, { name: 'robots', content: 'noindex, nofollow' }] }),
  component: AdminPage,
});

interface AdminSkill {
  id: string;
  name: string;
  category: string | null;
  compatible_with: string[];
  source_repo: string;
  author: string;
  stars: number;
  upvotes: number;
  view_count: number;
  is_reviewed: boolean;
  featured: boolean;
  has_summary: boolean;
}

interface AdminPost {
  id: string;
  title: string;
  author_name: string;
  flair: string | null;
  upvotes: number;
  created_at: string;
  comment_count: number;
}

const TRACKED_CATEGORIES = ['개발기술', '문서자동화', '크리에이티브', '데이터'] as const;
type SortKey = 'view_count' | 'upvotes' | 'stars' | 'name';
type SortDir = 'asc' | 'desc';
type AdminTab = 'skills' | 'community';

function AdminPage() {
  const [tab, setTab] = useState<AdminTab>('skills');
  const [skills, setSkills] = useState<AdminSkill[]>([]);
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>('stars');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [pendingDeletePostId, setPendingDeletePostId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [generating, setGenerating] = useState(false);

  const missingSummaryCount = useMemo(
    () => skills.filter(s => !s.has_summary).length,
    [skills],
  );

  const featuredCount = useMemo(
    () => skills.filter(s => s.featured).length,
    [skills],
  );
  const FEATURED_MAX = 6;

  const handleGenerateSummaries = async () => {
    setGenerating(true);
    toast.info('요약 생성 시작...');
    try {
      const { data, error } = await supabase.functions.invoke('generate-summary-ko', {
        body: {},
      });
      if (error) throw error;
      const r = data as { processed: number; succeeded: number; failed: number; remaining: number };
      toast.success(`완료: ${r.succeeded}/${r.processed} 성공 · 남은 ${r.remaining}개`);
      await load();
    } catch (e) {
      toast.error('요약 생성 실패: ' + (e instanceof Error ? e.message : String(e)));
    } finally {
      setGenerating(false);
    }
  };

  const load = async () => {
    setIsLoading(true);
    const [skillsResult, postsRes, commentsRes] = await Promise.all([
      fetchSkills().then(rows => ({ data: rows, error: null as unknown })).catch((e: unknown) => ({ data: [], error: e })),
      supabase.from('posts').select('id, title, author_name, flair, upvotes, created_at').order('created_at', { ascending: false }),
      supabase.from('post_comments').select('post_id'),
    ]);

    if (skillsResult.error) {
      toast.error('스킬 데이터를 불러오지 못했습니다');
    } else {
      setSkills(skillsResult.data.map(s => ({
        id: s.id,
        name: s.name,
        category: s.category,
        compatible_with: s.compatible_with,
        source_repo: s.source_repo,
        author: s.author,
        stars: s.stars,
        upvotes: s.upvotes,
        view_count: s.view_count,
        is_reviewed: s.is_reviewed,
        featured: s.featured ?? false,
        has_summary: !!s.summary_ko,
      })));
    }

    if (postsRes.data) {
      const counts: Record<string, number> = {};
      (commentsRes.data ?? []).forEach((c: { post_id: string }) => {
        counts[c.post_id] = (counts[c.post_id] ?? 0) + 1;
      });
      setPosts(
        (postsRes.data as Omit<AdminPost, 'comment_count'>[]).map(p => ({
          ...p,
          comment_count: counts[p.id] ?? 0,
        })),
      );
    }
    setIsLoading(false);
  };

  useEffect(() => { load(); }, []);

  const sorted = useMemo(() => {
    const list = [...skills];
    list.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortDir === 'desc' ? bv - av : av - bv;
      }
      const as = String(av ?? '');
      const bs = String(bv ?? '');
      return sortDir === 'desc' ? bs.localeCompare(as) : as.localeCompare(bs);
    });
    return list;
  }, [skills, sortKey, sortDir]);

  const totals = useMemo(() => {
    const totalViews = skills.reduce((s, x) => s + (x.view_count ?? 0), 0);
    const totalUpvotes = skills.reduce((s, x) => s + (x.upvotes ?? 0), 0);
    const categoryCounts: Record<string, number> = {};
    for (const c of TRACKED_CATEGORIES) categoryCounts[c] = 0;
    for (const s of skills) {
      if (s.category && categoryCounts[s.category] !== undefined) {
        categoryCounts[s.category] += 1;
      }
    }
    return { totalSkills: skills.length, totalViews, totalUpvotes, categoryCounts };
  }, [skills]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => (d === 'desc' ? 'asc' : 'desc'));
    else { setSortKey(key); setSortDir('desc'); }
  };

  const handleReviewToggle = async (skill: AdminSkill) => {
    const { error } = await supabase
      .from('skills')
      .update({ is_reviewed: !skill.is_reviewed })
      .eq('public_id', skill.id);
    if (error) {
      toast.error('업데이트 실패');
      return;
    }
    setSkills(prev => prev.map(s => (s.id === skill.id ? { ...s, is_reviewed: !skill.is_reviewed } : s)));
    toast.success('업데이트 완료');
  };
  const handleFeaturedToggle = async (skill: AdminSkill, next: boolean) => {
    if (next && featuredCount >= FEATURED_MAX) {
      toast.warning(`편집장픽은 최대 ${FEATURED_MAX}개까지 지정할 수 있어요`);
      return;
    }
    setSkills(prev => prev.map(s => (s.id === skill.id ? { ...s, featured: next } : s)));
    const { error } = await supabase
      .from('skills')
      .update({ featured: next })
      .eq('public_id', skill.id);
    if (error) {
      setSkills(prev => prev.map(s => (s.id === skill.id ? { ...s, featured: !next } : s)));
      toast.error('편집장픽 업데이트 실패');
    } else {
      toast.success(next ? '편집장픽으로 지정' : '편집장픽 해제');
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('skills').delete().eq('public_id', id);
    if (error) toast.error('삭제 실패');
    else {
      setSkills(prev => prev.filter(s => s.id !== id));
      toast.success('삭제되었습니다');
    }
    setPendingDeleteId(null);
  };

  const handleDeletePost = async (id: string) => {
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) toast.error('게시글 삭제에 실패했습니다');
    else {
      toast.success('게시글이 삭제되었습니다');
      setPosts(prev => prev.filter(p => p.id !== id));
    }
    setPendingDeletePostId(null);
  };

  return (
    <>
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-10">
          <header className="mb-8">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-lavender">관리자</p>
            <h1 className="text-3xl font-bold tracking-[-0.01em] text-foreground">운영 대시보드</h1>
            <p className="mt-2 text-sm text-muted-foreground">스킬과 커뮤니티 통합 운영.</p>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard icon={Layers} label="총 스킬 수" value={totals.totalSkills} />
            <StatCard icon={Eye} label="총 조회수" value={totals.totalViews} />
            <StatCard icon={Heart} label="총 좋아요" value={totals.totalUpvotes} />
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider">
                  <BarChart3 className="h-3.5 w-3.5 text-lavender" /> 카테고리별 분포
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-1.5">
                {TRACKED_CATEGORIES.map(cat => (
                  <div key={cat} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground truncate pr-2">{cat}</span>
                    <span className="font-semibold text-foreground tabular-nums">{totals.categoryCounts[cat] ?? 0}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="mb-4 inline-flex items-center gap-1 rounded-[10px] border border-border bg-card p-1">
            {([
              { id: 'skills', label: '스킬 전체' },
              { id: 'community', label: '커뮤니티' },
            ] as const).map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`px-4 py-1.5 text-sm font-semibold rounded-[8px] transition-all ${
                  tab === t.id ? 'bg-lavender text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}>
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'skills' && (
            <Card>
              <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
                <div>
                  <CardTitle className="text-lg">스킬 전체</CardTitle>
                  <CardDescription>기본 정렬: 별점. 컬럼 헤더 클릭으로 정렬 변경.</CardDescription>
                </div>
                <Button
                  onClick={handleGenerateSummaries}
                  disabled={generating || missingSummaryCount === 0}
                  className="bg-lavender text-foreground hover:bg-lavender/90"
                  size="sm"
                >
                  {generating ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> 생성 중...</>
                  ) : (
                    <><Sparkles className="h-4 w-4" /> 한국어 요약 자동 생성 ({missingSummaryCount})</>
                  )}
                </Button>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-lavender" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <SortableHead label="이름" k="name" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                        <TableHead>카테고리</TableHead>
                        <TableHead>호환CLI</TableHead>
                        <TableHead>레포</TableHead>
                        <TableHead>작성자</TableHead>
                        <SortableHead label="별점" k="stars" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} align="right" />
                        <TableHead>리뷰</TableHead>
                        <TableHead>
                          편집장픽
                          <span className={`ml-1.5 text-[10px] tabular-nums ${featuredCount > FEATURED_MAX ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}>
                            {featuredCount}/{FEATURED_MAX}
                          </span>
                        </TableHead>
                        <TableHead className="text-right">액션</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sorted.map(skill => (
                        <TableRow key={skill.id} className={skill.featured ? 'bg-amber/10 hover:bg-amber/15' : undefined}>
                          <TableCell className="font-medium max-w-[220px] truncate" title={skill.name}>{skill.name}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{skill.category ?? '—'}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {skill.compatible_with?.map(cli => (
                                <span key={cli} className="inline-flex items-center rounded-[6px] bg-secondary px-1.5 py-0.5 text-[10px] font-semibold uppercase text-secondary-foreground">
                                  {SKILL_CLI_LABELS[cli as SkillCli] ?? cli}
                                </span>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground font-mono max-w-[160px] truncate" title={skill.source_repo}>
                            {skill.source_repo}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{skill.author}</TableCell>
                          <TableCell className="text-right tabular-nums">
                            <span className="inline-flex items-center gap-1 justify-end">
                              <Star className="h-3 w-3 text-muted-foreground" />
                              {skill.stars}
                            </span>
                          </TableCell>
                          <TableCell>
                            <button onClick={() => handleReviewToggle(skill)}
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold transition-colors ${
                                skill.is_reviewed
                                  ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300'
                                  : 'bg-secondary text-muted-foreground hover:bg-secondary/70'
                              }`}>
                              {skill.is_reviewed ? <CheckCircle2 className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
                              {skill.is_reviewed ? '검토완료' : '미검토'}
                            </button>
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={skill.featured}
                              onCheckedChange={(v) => handleFeaturedToggle(skill, v)}
                              aria-label="편집장픽 토글"
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <AlertDialog open={pendingDeleteId === skill.id} onOpenChange={(open) => setPendingDeleteId(open ? skill.id : null)}>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive hover:text-destructive-foreground">
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>스킬을 삭제하시겠습니까?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    "{skill.name}"과(와) 모든 투표가 영구적으로 삭제됩니다.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>취소</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(skill.id)}>삭제</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))}
                      {sorted.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-12 text-sm text-muted-foreground">스킬이 없습니다.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )}

          {tab === 'community' && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-lavender" /> 커뮤니티 게시글
                </CardTitle>
                <CardDescription>최신순. 삭제 시 댓글도 함께 삭제됩니다.</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-lavender" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>제목</TableHead>
                        <TableHead>작성자</TableHead>
                        <TableHead>플레어</TableHead>
                        <TableHead className="text-right">좋아요</TableHead>
                        <TableHead className="text-right">댓글수</TableHead>
                        <TableHead>날짜</TableHead>
                        <TableHead className="text-right">액션</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {posts.map(post => (
                        <TableRow key={post.id}>
                          <TableCell className="font-medium max-w-[320px] truncate" title={post.title}>{post.title}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{post.author_name}</TableCell>
                          <TableCell>
                            {post.flair ? (
                              <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-secondary-foreground">
                                {post.flair}
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">{post.upvotes}</TableCell>
                          <TableCell className="text-right tabular-nums">{post.comment_count}</TableCell>
                          <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(post.created_at).toLocaleDateString('ko-KR')}
                          </TableCell>
                          <TableCell className="text-right">
                            <AlertDialog open={pendingDeletePostId === post.id} onOpenChange={(open) => setPendingDeletePostId(open ? post.id : null)}>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive hover:text-destructive-foreground">
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>게시글을 삭제하시겠습니까?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    "{post.title}"과(와) 연결된 모든 댓글이 영구적으로 삭제됩니다.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>취소</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeletePost(post.id)}>삭제</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))}
                      {posts.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-12 text-sm text-muted-foreground">게시글이 없습니다.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <AddSkillDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onCreated={() => { setAddOpen(false); load(); }}
      />
      <Toaster />
    </>
  );
}

function StatCard({ icon: Icon, label, value }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider">
          <Icon className="h-3.5 w-3.5 text-lavender" /> {label}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tabular-nums tracking-tight text-foreground">{value.toLocaleString()}</div>
      </CardContent>
    </Card>
  );
}

function SortableHead({ label, k, sortKey, sortDir, onSort, align = 'left' }: {
  label: string; k: SortKey; sortKey: SortKey; sortDir: SortDir; onSort: (k: SortKey) => void;
  align?: 'left' | 'right';
}) {
  const active = sortKey === k;
  return (
    <TableHead className={align === 'right' ? 'text-right' : ''}>
      <button onClick={() => onSort(k)}
        className={`inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider hover:text-foreground transition-colors ${
          active ? 'text-foreground' : 'text-muted-foreground'
        } ${align === 'right' ? 'flex-row-reverse' : ''}`}>
        {label}
        <ArrowUpDown className={`h-3 w-3 ${active ? 'opacity-100' : 'opacity-40'}`} />
        {active && <span className="text-[10px] font-normal">{sortDir === 'desc' ? '↓' : '↑'}</span>}
      </button>
    </TableHead>
  );
}

function AddSkillDialog({ open, onOpenChange, onCreated }: {
  open: boolean; onOpenChange: (v: boolean) => void; onCreated: () => void;
}) {
  const [name, setName] = useState('');
  const [descriptionKo, setDescriptionKo] = useState('');
  const [sourceRepo, setSourceRepo] = useState('');
  const [sourcePath, setSourcePath] = useState('');
  const [category, setCategory] = useState<string>('');
  const [clis, setClis] = useState<SkillCli[]>([]);
  const [author, setAuthor] = useState('');
  const [stars, setStars] = useState<number>(0);
  const [summaryWhat, setSummaryWhat] = useState('');
  const [summaryBenefits, setSummaryBenefits] = useState('');
  const [summaryHowto, setSummaryHowto] = useState('');
  const [summaryTarget, setSummaryTarget] = useState('');
  const [summaryTokenCost, setSummaryTokenCost] = useState<'low' | 'medium' | 'high'>('medium');
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setName(''); setDescriptionKo(''); setSourceRepo(''); setSourcePath('');
    setCategory(''); setClis([]); setAuthor(''); setStars(0);
    setSummaryWhat(''); setSummaryBenefits(''); setSummaryHowto('');
    setSummaryTarget(''); setSummaryTokenCost('medium');
  };

  const toggleCli = (c: SkillCli) => {
    setClis(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  };

  const submit = async () => {
    if (!name.trim() || !sourceRepo.trim() || !sourcePath.trim() || !author.trim() || clis.length === 0) {
      toast.error('이름, 저장소, 경로, 작성자, 호환CLI는 필수입니다');
      return;
    }
    const repoTrim = sourceRepo.trim().replace(/^\/+|\/+$/g, '');
    const pathTrim = sourcePath.trim().replace(/^\/+/, '');
    const folder = pathTrim.includes('/') ? pathTrim.slice(0, pathTrim.lastIndexOf('/')) : '';
    const githubUrl = `https://github.com/${repoTrim}/tree/main/${folder}`;

    const summaryKo = summaryWhat.trim() ? {
      what: summaryWhat.trim(),
      benefits: summaryBenefits.split('\n').map(s => s.trim()).filter(Boolean),
      howto: summaryHowto.trim() || undefined,
      target: summaryTarget.trim() || undefined,
      token_cost: summaryTokenCost,
    } : null;

    setSubmitting(true);
    const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `skill-${Date.now()}`;
    const { error } = await supabase.from('skills').insert({
      name: name.trim(),
      name_ko: name.trim(),
      public_id: slug,
      source_id: `${repoTrim}/${pathTrim}`,
      description_ko: descriptionKo.trim() || null,
      github_url: githubUrl,
      source_repo: repoTrim,
      source_path: pathTrim,
      author: author.trim(),
      stars: Number.isFinite(stars) ? stars : 0,
      compatible_with: clis,
      category: category || null,
    });
    setSubmitting(false);
    if (error) {
      toast.error('추가에 실패했습니다: ' + error.message);
      return;
    }
    toast.success('스킬이 추가되었습니다');
    reset();
    onCreated();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>스킬 추가</DialogTitle>
          <DialogDescription>새로운 GitHub 스킬을 등록합니다.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <Field label="이름 *">
            <input value={name} onChange={e => setName(e.target.value)} maxLength={200}
              className="w-full rounded-[8px] border border-border bg-card px-3 py-2 text-sm focus:border-lavender focus:outline-none focus:ring-2 focus:ring-lavender/30" />
          </Field>
          <Field label="한국어 설명">
            <textarea value={descriptionKo} onChange={e => setDescriptionKo(e.target.value)} rows={2}
              className="w-full rounded-[8px] border border-border bg-card px-3 py-2 text-sm focus:border-lavender focus:outline-none focus:ring-2 focus:ring-lavender/30 resize-y" />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="source_repo (owner/repo) *">
              <input value={sourceRepo} onChange={e => setSourceRepo(e.target.value)} placeholder="garrytan/gstack"
                className="w-full rounded-[8px] border border-border bg-card px-3 py-2 text-sm font-mono focus:border-lavender focus:outline-none focus:ring-2 focus:ring-lavender/30" />
            </Field>
            <Field label="source_path *">
              <input value={sourcePath} onChange={e => setSourcePath(e.target.value)} placeholder="review/SKILL.md"
                className="w-full rounded-[8px] border border-border bg-card px-3 py-2 text-sm font-mono focus:border-lavender focus:outline-none focus:ring-2 focus:ring-lavender/30" />
            </Field>
          </div>
          <Field label="카테고리">
            <div className="flex flex-wrap gap-2">
              {SKILL_CATEGORIES.map(c => (
                <button key={c} type="button" onClick={() => setCategory(c)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                    category === c ? 'bg-foreground text-background' : 'bg-secondary text-muted-foreground hover:text-foreground'
                  }`}>{c}</button>
              ))}
            </div>
          </Field>
          <Field label="호환 CLI * (다중선택)">
            <div className="flex flex-wrap gap-2">
              {SKILL_CLIS.map(c => (
                <button key={c} type="button" onClick={() => toggleCli(c)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide transition-all ${
                    clis.includes(c) ? 'bg-lavender text-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
                  }`}>{SKILL_CLI_LABELS[c]}</button>
              ))}
            </div>
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="작성자 *">
              <input value={author} onChange={e => setAuthor(e.target.value)} maxLength={100}
                className="w-full rounded-[8px] border border-border bg-card px-3 py-2 text-sm focus:border-lavender focus:outline-none focus:ring-2 focus:ring-lavender/30" />
            </Field>
            <Field label="별점 (stars)">
              <input type="number" min={0} value={stars} onChange={e => setStars(parseInt(e.target.value) || 0)}
                className="w-full rounded-[8px] border border-border bg-card px-3 py-2 text-sm tabular-nums focus:border-lavender focus:outline-none focus:ring-2 focus:ring-lavender/30" />
            </Field>
          </div>

          {/* Summary */}
          <div className="border-t border-border pt-4 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">요약 카드 (선택)</p>
            <Field label="한 줄 요약">
              <input value={summaryWhat} onChange={e => setSummaryWhat(e.target.value)} maxLength={200}
                placeholder="이 스킬이 하는 일을 한 줄로"
                className="w-full rounded-[8px] border border-border bg-card px-3 py-2 text-sm focus:border-lavender focus:outline-none focus:ring-2 focus:ring-lavender/30" />
            </Field>
            <Field label="장점 (줄바꿈으로 구분)">
              <textarea value={summaryBenefits} onChange={e => setSummaryBenefits(e.target.value)} rows={3}
                placeholder={"PR 리뷰 시간 80% 절감\nSQL 인젝션 자동 탐지"}
                className="w-full rounded-[8px] border border-border bg-card px-3 py-2 text-sm focus:border-lavender focus:outline-none focus:ring-2 focus:ring-lavender/30 resize-y" />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="사용법">
                <input value={summaryHowto} onChange={e => setSummaryHowto(e.target.value)}
                  placeholder="설치 후 /review 명령으로 실행"
                  className="w-full rounded-[8px] border border-border bg-card px-3 py-2 text-sm focus:border-lavender focus:outline-none focus:ring-2 focus:ring-lavender/30" />
              </Field>
              <Field label="대상">
                <input value={summaryTarget} onChange={e => setSummaryTarget(e.target.value)}
                  placeholder="코드 리뷰에 시간 쓰는 개발자"
                  className="w-full rounded-[8px] border border-border bg-card px-3 py-2 text-sm focus:border-lavender focus:outline-none focus:ring-2 focus:ring-lavender/30" />
              </Field>
            </div>
            <Field label="토큰 소모">
              <div className="flex gap-2">
                {(['low', 'medium', 'high'] as const).map(v => (
                  <button key={v} type="button" onClick={() => setSummaryTokenCost(v)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                      summaryTokenCost === v ? 'bg-foreground text-background' : 'bg-secondary text-muted-foreground hover:text-foreground'
                    }`}>
                    {{ low: '낮음', medium: '보통', high: '높음' }[v]}
                  </button>
                ))}
              </div>
            </Field>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>취소</Button>
          <Button onClick={submit} disabled={submitting} className="bg-lavender text-foreground hover:bg-lavender/90">
            {submitting && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
            추가
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}
