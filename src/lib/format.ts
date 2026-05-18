/**
 * Display formatters & psychological signal helpers for skill cards.
 */

export function formatCount(n: number | null | undefined, fallback = '–'): string {
  if (n == null || n <= 0) return fallback;
  if (n < 1000) return String(n);
  if (n < 10_000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  if (n < 1_000_000) return Math.round(n / 1000) + 'k';
  return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
}

export type TokenCost = 'low' | 'medium' | 'high';

export function formatTokenCost(level?: TokenCost | null): { icon: string; label: string } | null {
  if (!level) return null;
  if (level === 'low') return { icon: '⚡', label: '가벼움' };
  if (level === 'medium') return { icon: '🔋', label: '보통' };
  return { icon: '💎', label: '고급' };
}

export interface SignalBadge {
  label: string;
  emoji: string;
  className: string;
}

interface SignalInput {
  upvotes?: number | null;
  downvotes?: number | null;
  stars?: number | null;
  view_count?: number | null;
  created_at: string;
  is_reviewed?: boolean | null;
}

/** Reused (lightweight) hot score for badge thresholding. */
function hotScoreFor(s: SignalInput): number {
  const net = (s.upvotes ?? 0) - (s.downvotes ?? 0);
  const order = Math.log10(Math.max(Math.abs(net), 1));
  const sign = net > 0 ? 1 : net < 0 ? -1 : 0;
  const ageHours = (Date.now() - new Date(s.created_at).getTime()) / 3_600_000;
  return (
    sign * order +
    Math.log10((s.stars ?? 0) + 1) * 0.3 +
    Math.log10((s.view_count ?? 0) + 1) * 0.15 -
    ageHours / 45
  );
}

/**
 * Returns the single highest-priority signal badge for a card.
 * Priority: HOT > NEW > 에디터픽 > null
 */
export function getSignalBadge(s: SignalInput): SignalBadge | null {
  const ageDays = (Date.now() - new Date(s.created_at).getTime()) / 86_400_000;
  const score = hotScoreFor(s);

  // HOT: meaningful momentum AND recent enough to feel alive
  if (score > 1.5 && ageDays < 21) {
    return {
      label: 'HOT',
      emoji: '🔥',
      className:
        'bg-[oklch(0.95_0.05_30)] text-[oklch(0.45_0.18_30)] dark:bg-[oklch(0.30_0.08_30)] dark:text-[oklch(0.85_0.12_30)]',
    };
  }

  if (ageDays < 7) {
    return {
      label: 'NEW',
      emoji: '🆕',
      className:
        'bg-lavender/20 text-[oklch(0.40_0.15_290)] dark:bg-lavender/25 dark:text-[oklch(0.85_0.10_290)]',
    };
  }

  if (s.is_reviewed) {
    return {
      label: '에디터 픽',
      emoji: '✨',
      className:
        'bg-amber/15 text-amber-foreground dark:bg-amber/20 dark:text-amber-foreground',
    };
  }

  return null;
}
