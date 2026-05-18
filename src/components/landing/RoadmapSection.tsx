import { Award, Upload, User, Puzzle, Sparkles, Trophy } from 'lucide-react';
import { Link } from '@tanstack/react-router';

const ROADMAP = [
  { icon: Award, title: '레벨 시스템', desc: '스킬을 저장할수록 레벨업. 입학생부터 교수까지.', href: '/my-skills' as string | null },
  { icon: Upload, title: '스킬 제출', desc: '내가 만든 스킬을 스킬학교에 등록하세요.', href: '/submit' as string | null },
  { icon: User, title: '나의 스킬함', desc: '저장한 스킬을 한곳에 모아 언제든 다시 찾아보세요.', href: '/my-skills' as string | null },
  { icon: Trophy, title: '퀘스트 시스템', desc: '스킬을 써서 미션을 클리어하고 레벨업하세요.', href: null as string | null },
  { icon: Puzzle, title: 'MCP 마켓', desc: 'Claude에 연결할 수 있는 MCP 서버도 곧 만나보세요.', href: null as string | null },
];

export function RoadmapSection() {
  return (
    <section className="relative py-14 sm:py-16 border-t border-border/60 bg-secondary/30">
      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        <div className="mb-8 flex flex-col items-start gap-2">
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-lavender">
            <Sparkles className="h-3.5 w-3.5" strokeWidth={2.5} />
            ROADMAP
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-[-0.01em] text-foreground">스킬학교 로드맵</h2>
          <p className="text-sm text-muted-foreground">준비 중인 기능들</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ROADMAP.map(item => {
            const Icon = item.icon;
            const isLive = !!item.href;
            const inner = (
              <>
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[10px] bg-lavender/15">
                  <Icon className="h-5 w-5 text-lavender" strokeWidth={2} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
                    {isLive ? (
                      <span className="inline-flex items-center rounded-full border border-lavender/40 bg-lavender/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-lavender">
                        Live
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full border border-border bg-background/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Coming Soon
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-sm leading-[1.55] text-muted-foreground">{item.desc}</p>
                </div>
              </>
            );
            if (isLive && item.href) {
              return (
                <Link
                  key={item.title}
                  to={item.href}
                  className="relative flex items-start gap-4 rounded-[16px] border border-border/60 bg-card p-5 sm:p-6 transition-colors hover:bg-lavender/5 hover:border-lavender/40"
                >
                  {inner}
                </Link>
              );
            }
            return (
              <div
                key={item.title}
                aria-disabled="true"
                className="relative flex items-start gap-4 rounded-[16px] border border-border/60 bg-muted/60 p-5 sm:p-6 cursor-not-allowed select-none"
              >
                {inner}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
