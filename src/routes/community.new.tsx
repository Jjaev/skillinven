import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { ThemeToggle } from '@/components/brand/ThemeToggle';

export const Route = createFileRoute('/community/new')({
  head: () => ({ meta: [{ title: '새 글 작성 — 스킬학교' }, { name: 'robots', content: 'noindex, nofollow' }] }),
  component: NewPostPage,
});

const FLAIRS = ['스킬추천', '업데이트', '잡담', '질문'] as const;
type Flair = (typeof FLAIRS)[number];

const NICK_KEY = 'community_nickname';

function NewPostPage() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [flair, setFlair] = useState<Flair | ''>('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(NICK_KEY) : null;
    if (saved) setNickname(saved);
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim() || !title.trim() || !content.trim() || !flair) {
      toast.error('모든 항목을 입력해 주세요');
      return;
    }
    setSubmitting(true);
    const { data, error } = await supabase
      .from('posts')
      .insert({
        title: title.trim(),
        content: content.trim(),
        author_name: nickname.trim(),
        flair,
      })
      .select('id')
      .single();

    if (error || !data) {
      toast.error('등록에 실패했습니다');
      setSubmitting(false);
      return;
    }
    localStorage.setItem(NICK_KEY, nickname.trim());
    toast.success('게시되었습니다');
    navigate({ to: '/community/$postId', params: { postId: data.id } });
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
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-lavender">새 글</p>
          <h1 className="mb-6 text-3xl font-bold tracking-[-0.01em] text-foreground">글쓰기</h1>

          <form onSubmit={onSubmit} className="space-y-5">
            {/* Nickname */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-foreground">닉네임</label>
              <input
                type="text"
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                placeholder="표시될 이름"
                maxLength={20}
                className="w-full rounded-[10px] border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-lavender focus:outline-none focus:ring-2 focus:ring-lavender/30"
              />
              <p className="mt-1 text-xs text-muted-foreground">다음 글쓰기에 자동으로 채워집니다</p>
            </div>

            {/* Flair */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-foreground">분류 *</label>
              <div className="flex flex-wrap gap-2">
                {FLAIRS.map(f => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFlair(f)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                      flair === f
                        ? 'bg-foreground text-background'
                        : 'bg-secondary text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-foreground">제목</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="무엇에 대해 이야기하시나요?"
                maxLength={200}
                className="w-full rounded-[10px] border border-border bg-card px-3 py-2 text-base font-medium text-foreground placeholder:text-muted-foreground focus:border-lavender focus:outline-none focus:ring-2 focus:ring-lavender/30"
              />
            </div>

            {/* Content */}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-foreground">본문</label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                rows={10}
                placeholder="자유롭게 작성해 주세요"
                className="w-full rounded-[10px] border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-lavender focus:outline-none focus:ring-2 focus:ring-lavender/30 leading-relaxed resize-y"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Link
                to="/community"
                className="rounded-[10px] border border-border bg-card px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                취소
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-1.5 rounded-[10px] bg-lavender px-5 py-2 text-sm font-semibold text-foreground hover:shadow-md hover:shadow-lavender/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                게시
              </button>
            </div>
          </form>
        </main>
      </div>
      <Toaster />
    </>
  );
}
