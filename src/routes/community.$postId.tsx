import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { ArrowLeft, ThumbsUp, Loader2 } from 'lucide-react';
import { ThemeToggle } from '@/components/brand/ThemeToggle';

export const Route = createFileRoute('/community/$postId')({
  head: ({ params }) => ({
    meta: [
      { title: '커뮤니티 글 — 스킬학교' },
      { name: 'description', content: '스킬학교 커뮤니티의 AI 스킬 추천·후기·질문 글.' },
      { property: 'og:title', content: '커뮤니티 글 — 스킬학교' },
      { property: 'og:description', content: '스킬학교 커뮤니티의 AI 스킬 추천·후기·질문 글.' },
      { property: 'og:url', content: `https://skillschoolkorea.lovable.app/community/${params.postId}` },
      { property: 'og:type', content: 'article' },
    ],
    links: [
      { rel: 'canonical', href: `https://skillschoolkorea.lovable.app/community/${params.postId}` },
    ],
  }),
  component: PostDetailPage,
});

interface Post {
  id: string;
  title: string;
  content: string;
  author_name: string;
  flair: string | null;
  upvotes: number;
  created_at: string;
}

interface Comment {
  id: string;
  content: string;
  author_name: string;
  created_at: string;
}

const FLAIR_STYLES: Record<string, string> = {
  '스킬추천': 'bg-lavender/15 text-[oklch(0.45_0.12_290)] dark:text-lavender',
  '업데이트': 'bg-amber/20 text-amber-foreground',
  '잡담': 'bg-secondary text-muted-foreground',
  '질문': 'bg-[oklch(0.94_0.04_180)] text-[oklch(0.40_0.12_200)]',
};

const NICK_KEY = 'community_nickname';
const UPVOTED_KEY = 'community_upvoted_posts';

function getUpvotedSet(): Set<string> {
  try {
    const raw = localStorage.getItem(UPVOTED_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function PostDetailPage() {
  const { postId } = Route.useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [nickname, setNickname] = useState('');
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setHasUpvoted(getUpvotedSet().has(postId));
    const saved = localStorage.getItem(NICK_KEY);
    if (saved) setNickname(saved);
  }, [postId]);

  const load = async () => {
    setLoading(true);
    const [postRes, commentsRes] = await Promise.all([
      supabase.from('posts').select('*').eq('id', postId).maybeSingle(),
      supabase.from('post_comments').select('*').eq('post_id', postId).order('created_at', { ascending: false }),
    ]);
    if (postRes.data) setPost(postRes.data as Post);
    if (commentsRes.data) setComments(commentsRes.data as Comment[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const handleUpvote = async () => {
    if (hasUpvoted || !post) return;
    setHasUpvoted(true);
    setPost({ ...post, upvotes: post.upvotes + 1 });
    const set = getUpvotedSet();
    set.add(postId);
    localStorage.setItem(UPVOTED_KEY, JSON.stringify([...set]));

    const { error } = await supabase.rpc('increment_post_upvote', { _post_id: postId });
    if (error) {
      // rollback
      setHasUpvoted(false);
      setPost(p => (p ? { ...p, upvotes: p.upvotes - 1 } : p));
      set.delete(postId);
      localStorage.setItem(UPVOTED_KEY, JSON.stringify([...set]));
      toast.error('좋아요 처리에 실패했습니다');
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim() || !commentText.trim()) {
      toast.error('닉네임과 내용을 입력해 주세요');
      return;
    }
    setSubmitting(true);
    const { data, error } = await supabase
      .from('post_comments')
      .insert({ post_id: postId, author_name: nickname.trim(), content: commentText.trim() })
      .select('*')
      .single();
    setSubmitting(false);
    if (error || !data) {
      toast.error('댓글 등록에 실패했습니다');
      return;
    }
    localStorage.setItem(NICK_KEY, nickname.trim());
    setComments(prev => [data as Comment, ...prev]);
    setCommentText('');
    toast.success('댓글이 등록되었습니다');
  };

  return (
    <>
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur-xl">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-4 sm:px-6 py-3">
            <Link to="/community" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" /> 커뮤니티
            </Link>
            <ThemeToggle />
          </div>
        </header>

        <main className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-lavender" />
            </div>
          ) : !post ? (
            <div className="rounded-[16px] border border-dashed border-border bg-card/40 py-16 text-center">
              <p className="text-sm text-muted-foreground">게시글을 찾을 수 없습니다.</p>
              <Link to="/community" className="mt-4 inline-block text-sm font-semibold text-lavender">목록으로</Link>
            </div>
          ) : (
            <>
              {/* Post header */}
              <article className="rounded-[16px] border border-border bg-card p-5 sm:p-7">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  {post.flair && (
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${FLAIR_STYLES[post.flair] ?? 'bg-secondary text-muted-foreground'}`}>
                      {post.flair}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">{post.author_name}</span>
                  <span className="text-xs text-muted-foreground">·</span>
                  <span className="text-xs text-muted-foreground">{formatDate(post.created_at)}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-[-0.01em] text-foreground leading-tight">
                  {post.title}
                </h1>
                <div className="mt-5 whitespace-pre-wrap text-[15px] leading-[1.7] text-foreground">
                  {post.content}
                </div>

                {/* Upvote */}
                <div className="mt-6 flex items-center gap-3 border-t border-border/60 pt-5">
                  <button
                    onClick={handleUpvote}
                    disabled={hasUpvoted}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                      hasUpvoted
                        ? 'bg-lavender/30 text-foreground cursor-default'
                        : 'bg-lavender text-foreground hover:shadow-md hover:shadow-lavender/25'
                    }`}
                  >
                    <ThumbsUp className={`h-4 w-4 ${hasUpvoted ? 'fill-current' : ''}`} />
                    좋아요 <span className="tabular-nums">{post.upvotes}</span>
                  </button>
                  {hasUpvoted && <span className="text-xs text-muted-foreground">좋아요를 눌렀어요</span>}
                </div>
              </article>

              {/* Comments */}
              <section className="mt-8">
                <h2 className="mb-4 text-lg font-bold text-foreground">
                  댓글 <span className="text-muted-foreground tabular-nums">{comments.length}</span>
                </h2>

                {/* Comment form */}
                <form onSubmit={handleCommentSubmit} className="mb-6 rounded-[14px] border border-border bg-card p-4">
                  <div className="mb-3">
                    <input
                      type="text"
                      value={nickname}
                      onChange={e => setNickname(e.target.value)}
                      placeholder="닉네임"
                      maxLength={20}
                      className="w-full rounded-[8px] border border-border bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-lavender focus:outline-none focus:ring-2 focus:ring-lavender/30"
                    />
                  </div>
                  <textarea
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    rows={3}
                    placeholder="댓글을 입력해 주세요"
                    className="w-full rounded-[8px] border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-lavender focus:outline-none focus:ring-2 focus:ring-lavender/30 resize-y"
                  />
                  <div className="mt-3 flex justify-end">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex items-center gap-1.5 rounded-[10px] bg-lavender px-4 py-1.5 text-sm font-semibold text-foreground hover:shadow-md hover:shadow-lavender/25 transition-all disabled:opacity-60"
                    >
                      {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      댓글 달기
                    </button>
                  </div>
                </form>

                {/* Comment list */}
                {comments.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-8">아직 댓글이 없습니다.</p>
                ) : (
                  <ul className="flex flex-col gap-3">
                    {comments.map(c => (
                      <li key={c.id} className="rounded-[12px] border border-border bg-card p-4">
                        <div className="mb-1.5 flex items-center gap-2 text-xs">
                          <span className="font-semibold text-foreground">{c.author_name}</span>
                          <span className="text-muted-foreground">·</span>
                          <span className="text-muted-foreground">{formatDate(c.created_at)}</span>
                        </div>
                        <p className="whitespace-pre-wrap text-sm leading-[1.6] text-foreground">{c.content}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </>
          )}
        </main>
      </div>
      <Toaster />
    </>
  );
}
