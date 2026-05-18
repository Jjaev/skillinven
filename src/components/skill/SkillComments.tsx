import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, Trash2, Loader2, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from '@tanstack/react-router';

interface SkillComment {
  id: string;
  skill_id: string;
  user_id: string;
  author_name: string;
  content: string;
  rating: number | null;
  created_at: string;
}

interface Props {
  skillUuid: string;
}

function formatRelative(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return '방금 전';
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}일 전`;
  return new Date(iso).toLocaleDateString('ko-KR');
}

export function SkillComments({ skillUuid }: Props) {
  const { user, profile, isLoading: authLoading } = useAuth();
  const [comments, setComments] = useState<SkillComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from('skill_comments')
      .select('*')
      .eq('skill_id', skillUuid)
      .order('created_at', { ascending: false });
    if (!error) setComments((data as SkillComment[]) ?? []);
    setLoading(false);
  }, [skillUuid]);

  useEffect(() => {
    load();
    const channel = supabase
      .channel(`skill_comments_${skillUuid}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'skill_comments', filter: `skill_id=eq.${skillUuid}` },
        () => { load(); }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [skillUuid, load]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error('로그인이 필요합니다.'); return; }
    const trimmed = content.trim();
    if (trimmed.length < 1 || trimmed.length > 1000) {
      toast.error('댓글은 1~1000자 사이로 입력해주세요.');
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from('skill_comments').insert({
      skill_id: skillUuid,
      user_id: user.id,
      author_name: profile?.name ?? user.email?.split('@')[0] ?? '익명',
      content: trimmed,
      rating: rating > 0 ? rating : null,
    });
    setSubmitting(false);
    if (error) { toast.error('등록 실패: ' + error.message); return; }
    setContent('');
    setRating(0);
    toast.success('댓글이 등록되었습니다.');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('댓글을 삭제하시겠어요?')) return;
    const { error } = await supabase.from('skill_comments').delete().eq('id', id);
    if (error) { toast.error('삭제 실패: ' + error.message); return; }
    toast.success('삭제되었습니다.');
  };

  const ratings = comments.filter(c => c.rating != null).map(c => c.rating!);
  const avgRating = ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length) : null;

  return (
    <section className="mt-12 space-y-5">
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <h2 className="text-lg font-bold tracking-tight text-foreground inline-flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-lavender" />
          사용 후기 <span className="text-muted-foreground font-medium">({comments.length})</span>
        </h2>
        {avgRating != null && (
          <div className="inline-flex items-center gap-1.5 text-sm">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="font-semibold tabular-nums">{avgRating.toFixed(1)}</span>
            <span className="text-muted-foreground">/ 5 · {ratings.length}개 평가</span>
          </div>
        )}
      </div>

      {/* Form */}
      {authLoading ? null : user ? (
        <form onSubmit={handleSubmit} className="rounded-[16px] border border-border/60 bg-card p-4 sm:p-5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">별점 (선택)</span>
            <div className="flex items-center gap-0.5" onMouseLeave={() => setHoverRating(0)}>
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n === rating ? 0 : n)}
                  onMouseEnter={() => setHoverRating(n)}
                  className="p-1 -m-1"
                  aria-label={`${n}점`}
                >
                  <Star className={`h-5 w-5 transition-colors ${
                    n <= (hoverRating || rating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-muted-foreground/40'
                  }`} />
                </button>
              ))}
            </div>
          </div>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="이 스킬을 써본 경험을 남겨주세요. (1~1000자)"
            maxLength={1000}
            rows={3}
          />
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground tabular-nums">{content.length}/1000</span>
            <Button type="submit" size="sm" disabled={submitting || content.trim().length === 0}
              className="bg-lavender text-foreground hover:bg-lavender/90">
              {submitting ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> 등록 중</> : '댓글 등록'}
            </Button>
          </div>
        </form>
      ) : (
        <div className="rounded-[16px] border border-dashed border-border bg-card/50 p-5 text-center text-sm text-muted-foreground">
          댓글을 남기려면 <Link to="/" className="font-medium text-lavender hover:underline">로그인</Link>이 필요합니다.
        </div>
      )}

      {/* List */}
      {loading ? (
        <p className="text-sm text-muted-foreground">불러오는 중...</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">아직 댓글이 없습니다. 첫 후기를 남겨보세요!</p>
      ) : (
        <ul className="space-y-3">
          {comments.map(c => (
            <li key={c.id} className="rounded-[12px] border border-border/60 bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-foreground">{c.author_name}</span>
                    {c.rating != null && (
                      <span className="inline-flex items-center gap-0.5 text-xs">
                        {[1, 2, 3, 4, 5].map(n => (
                          <Star key={n} className={`h-3 w-3 ${
                            n <= c.rating! ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'
                          }`} />
                        ))}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">{formatRelative(c.created_at)}</span>
                  </div>
                  <p className="mt-1.5 text-sm text-foreground whitespace-pre-wrap break-words leading-relaxed">{c.content}</p>
                </div>
                {user?.id === c.user_id && (
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="shrink-0 p-1.5 -m-1.5 text-muted-foreground hover:text-destructive transition-colors"
                    aria-label="삭제"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
