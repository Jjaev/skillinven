/**
 * Mini terminal-window styled area chart showing AI skill ecosystem growth.
 */
interface TrendChartProps {
  className?: string;
}

const DATA = [1, 1.2, 1.5, 1.8, 2.2, 2.8, 3.5, 4.2, 5.0, 5.8, 6.0];
const X_LABELS = ['2월', '3월', '4월'];

export function TrendChart({ className }: TrendChartProps) {
  // Build SVG path on a 280x110 viewBox (chart area)
  const w = 280;
  const h = 110;
  const padX = 8;
  const padY = 8;
  const maxV = Math.max(...DATA);
  const minV = Math.min(...DATA);
  const range = maxV - minV || 1;
  const stepX = (w - padX * 2) / (DATA.length - 1);

  const points = DATA.map((v, i) => {
    const x = padX + i * stepX;
    const y = padY + (1 - (v - minV) / range) * (h - padY * 2);
    return [x, y] as const;
  });

  const linePath = points
    .map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`)
    .join(' ');
  const areaPath =
    `${linePath} L${points[points.length - 1][0].toFixed(2)},${(h - padY).toFixed(2)} ` +
    `L${points[0][0].toFixed(2)},${(h - padY).toFixed(2)} Z`;

  return (
    <div
      className={`overflow-hidden rounded-[12px] border border-border bg-[oklch(0.16_0.015_280)] shadow-lg ${className ?? ''}`}
    >
      {/* Window chrome */}
      <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-2 font-mono text-[11px] text-white/50">trend.tsx</span>
      </div>

      {/* Chart */}
      <div className="px-3 pt-3 pb-2">
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" aria-hidden="true">
          <defs>
            <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.75 0.15 70)" stopOpacity="0.55" />
              <stop offset="100%" stopColor="oklch(0.75 0.15 70)" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          {/* baseline grid */}
          <line x1={padX} y1={h - padY} x2={w - padX} y2={h - padY} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <path d={areaPath} fill="url(#trendFill)" />
          <path d={linePath} fill="none" stroke="oklch(0.78 0.16 70)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
          {/* end dot */}
          <circle
            cx={points[points.length - 1][0]}
            cy={points[points.length - 1][1]}
            r="3.5"
            fill="oklch(0.78 0.16 70)"
            stroke="oklch(0.16 0.015 280)"
            strokeWidth="2"
          />
        </svg>
        {/* x labels */}
        <div className="mt-1 flex justify-between font-mono text-[10px] text-white/40">
          {X_LABELS.map(l => <span key={l}>{l}</span>)}
        </div>
      </div>

      {/* Caption */}
      <div className="border-t border-white/10 px-3 py-2 font-mono text-[10px] leading-snug text-white/55">
        Claude Code 주간 활성 사용자<br />
        <span className="text-[oklch(0.78_0.16_70)]">4개월 6배 성장</span>
      </div>
    </div>
  );
}
