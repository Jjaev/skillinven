import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { ArrowLeft, MessageSquare, ThumbsUp, Plus, Loader2 } from 'lucide-react';
import { ThemeToggle } from '@/components/brand/ThemeToggle';

export const Route = createFileRoute('/community')({
  head: () => ({
    meta: [
      { title: '커뮤니티 — 스킬학교' },
      { name: 'description', content: 'AI 스킬 추천, 사용 후기, 질문과 잡담. 한국 AI CLI 사용자 커뮤니티에서 함께 배워요.' },
      { property: 'og:title', content: '커뮤니티 — 스킬학교' },
      { property: 'og:description', content: 'AI 스킬 추천 · 후기 · 질문 · 잡담을 나누는 한국 AI 사용자 커뮤니티.' },
      { property: 'og:url', content: 'https://skillschoolkorea.lovable.app/community' },
      { property: 'og:type', content: 'website' },
    ],
    links: [
      { rel: 'canonical', href: 'https://skillschoolkorea.lovable.app/community' },
    ],
  }),
  component: CommunityPage,
});

interface Post {
  id: string;
  title: string;
  content: string;
  author_name: string;
  flair: string | null;
  upvotes: number;
  created_at: string;
  comment_count?: number;
}

const FLAIRS = ['스킬추천', '업데이트', '잡담', '질문'] as const;
type Flair = (typeof FLAIRS)[number];

const FLAIR_STYLES: Record<string, string> = {
  '스킬추천': 'bg-lavender/15 text-[oklch(0.45_0.12_290)] dark:text-lavender',
  '업데이트': 'bg-amber/20 text-amber-foreground',
  '잡담': 'bg-secondary text-muted-foreground',
  '질문': 'bg-[oklch(0.94_0.04_180)] text-[oklch(0.40_0.12_200)]',
};

type SortKey = 'recent' | 'popular';

function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = (now.getTime() - d.getTime()) / 1000;
  if (diff < 60) return '방금 전';
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}일 전`;
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' });
}

function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortKey>('recent');
  const [flairFilter, setFlairFilter] = useState<Flair | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data: postsData } = await supabase
        .from('posts')
        .select('id, title, content, author_name, flair, upvotes, created_at')
        .order('created_at', { ascending: false });

      // Comment counts
      const { data: cData } = await supabase
        .from('post_comments')
        .select('post_id');

      const counts: Record<string, number> = {};
      (cData ?? []).forEach((c: { post_id: string }) => {
        counts[c.post_id] = (counts[c.post_id] ?? 0) + 1;
      });

      const merged = (postsData ?? []).map(p => ({ ...p, comment_count: counts[p.id] ?? 0 }));
      setPosts(merged as Post[]);
      setLoading(false);
    };
    load();
  }, []);

  const visible = useMemo(() => {
    let list = [...posts];
    if (flairFilter) list = list.filter(p => p.flair === flairFilter);
    if (sort === 'popular') list.sort((a, b) => b.upvotes - a.upvotes);
    else list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return list;
  }, [posts, sort, flairFilter]);

  return (
    <>
      <div className="min-h-screen bg-background">
        {/* Top bar */}
        <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur-xl">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 sm:px-6 py-3">
            <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" /> 홈으로
            </Link>
            <div className="flex items-center gap-2">
              <Link to="/directory" className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
                스킬 찾기
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
          {/* Title row */}
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-lavender">커뮤니티</p>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-[-0.01em] text-foreground">함께 이야기해요</h1>
              <p className="mt-2 text-sm text-muted-foreground">스킬 추천, 질문, 잡담 모두 환영합니다.</p>
            </div>
            <Link
              to="/community/new"
              className="inline-flex items-center gap-1.5 rounded-[10px] bg-lavender px-4 py-2 text-sm font-semibold text-foreground hover:shadow-md hover:shadow-lavender/25 transition-all shrink-0"
            >
              <Plus className="h-4 w-4" /> 글쓰기
            </Link>
          </div>

          {/* Sort tabs */}
          <div className="mb-3 inline-flex items-center gap-1 rounded-[10px] border border-border bg-card p-1">
            {[
              { id: 'recent', label: '최신순' },
              { id: 'popular', label: '인기순' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSort(tab.id as SortKey)}
                className={`px-4 py-1.5 text-sm font-semibold rounded-[8px] transition-all ${
                  sort === tab.id ? 'bg-lavender text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Flair filter */}
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mr-1">분류</span>
            <button
              onClick={() => setFlairFilter(null)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                flairFilter === null ? 'bg-foreground text-background' : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              전체
            </button>
            {FLAIRS.map(f => (
              <button
                key={f}
                onClick={() => setFlairFilter(f)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${
                  flairFilter === f
                    ? 'bg-foreground text-background'
                    : `${FLAIR_STYLES[f]} hover:opacity-80`
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Posts */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-lavender" />
            </div>
          ) : visible.length === 0 ? (
            <div className="rounded-[16px] border border-dashed border-border bg-card/40 py-16 text-center">
              <p className="text-sm text-muted-foreground">아직 글이 없습니다. 첫 글을 작성해 보세요.</p>
              <Link
                to="/community/new"
                className="mt-4 inline-flex items-center gap-1.5 rounded-[10px] bg-lavender px-4 py-2 text-sm font-semibold text-foreground"
              >
                <Plus className="h-4 w-4" /> 글쓰기
              </Link>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {visible.map(post => (
                <li key={post.id}>
                  <Link
                    to="/community/$postId"
                    params={{ postId: post.id }}
                    className="group flex flex-col rounded-[14px] border border-border bg-card p-4 sm:p-5 hover:border-lavender/50 hover:shadow-md hover:shadow-lavender/5 transition-all"
                  >
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      {post.flair && (
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${FLAIR_STYLES[post.flair] ?? 'bg-secondary text-muted-foreground'}`}>
                          {post.flair}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">{post.author_name}</span>
                      <span className="text-xs text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">{formatDate(post.created_at)}</span>
                    </div>
                    <h2 className="text-lg font-semibold text-foreground leading-tight group-hover:text-lavender transition-colors">
                      {post.title}
                    </h2>
                    <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2 leading-[1.5]">
                      {post.content}
                    </p>
                    <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <ThumbsUp className="h-3.5 w-3.5" />
                        <span className="tabular-nums">{post.upvotes}</span>
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span className="tabular-nums">{post.comment_count ?? 0}</span>
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </main>
      </div>
      <Toaster />
    </>
  );
}
