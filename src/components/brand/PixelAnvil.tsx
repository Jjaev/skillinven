/**
 * Pixel-art anvil + hammer illustration.
 * Pure inline SVG using <rect> blocks to mimic a Minecraft-style pixel grid.
 * Not derived from Minecraft assets; original pixel design.
 */
interface PixelAnvilProps {
  className?: string;
}

// Color palette (warm forge tones to fit amber/lavender brand)
const C = {
  anvilDark: '#2a1f1a',
  anvilMid: '#4a382e',
  anvilLight: '#6a5246',
  anvilHighlight: '#8a6e5e',
  hammerHandle: '#7a4a28',
  hammerHandleDark: '#5a3418',
  hammerHead: '#3a3a42',
  hammerHeadLight: '#6a6a72',
  spark: '#f59e0b',
  sparkLight: '#fcd34d',
};

export function PixelAnvil({ className }: PixelAnvilProps) {
  // 16x16 grid, each cell = 8 SVG units → 128x128 viewBox.
  // We render with shape-rendering: crispEdges for blocky look.
  const px = (x: number, y: number, w: number, h: number, fill: string) => (
    <rect key={`${x}-${y}-${fill}`} x={x * 8} y={y * 8} width={w * 8} height={h * 8} fill={fill} />
  );

  return (
    <svg
      viewBox="0 0 128 128"
      className={className}
      style={{ shapeRendering: 'crispEdges' }}
      aria-hidden="true"
    >
      {/* Sparks (top-right) */}
      {px(13, 1, 1, 1, C.sparkLight)}
      {px(14, 2, 1, 1, C.spark)}
      {px(12, 3, 1, 1, C.spark)}
      {px(15, 4, 1, 1, C.sparkLight)}

      {/* Hammer head (top-left, angled hint via stack) */}
      {px(1, 2, 4, 1, C.hammerHead)}
      {px(1, 3, 4, 2, C.hammerHeadLight)}
      {px(1, 5, 4, 1, C.hammerHead)}
      {/* Hammer handle going down-right */}
      {px(4, 5, 1, 1, C.hammerHandleDark)}
      {px(5, 6, 1, 1, C.hammerHandle)}
      {px(6, 7, 1, 1, C.hammerHandle)}
      {px(7, 8, 1, 1, C.hammerHandleDark)}

      {/* Anvil top plate */}
      {px(2, 8, 12, 1, C.anvilHighlight)}
      {px(2, 9, 12, 2, C.anvilLight)}
      {/* Anvil horn (left protrusion) */}
      {px(0, 9, 2, 1, C.anvilLight)}
      {px(0, 10, 2, 1, C.anvilMid)}
      {/* Anvil top edge dark */}
      {px(2, 11, 12, 1, C.anvilMid)}

      {/* Anvil neck (narrows) */}
      {px(4, 11, 8, 1, C.anvilMid)}
      {px(5, 12, 6, 2, C.anvilDark)}
      {px(5, 12, 6, 1, C.anvilMid)}

      {/* Anvil base */}
      {px(2, 14, 12, 1, C.anvilLight)}
      {px(2, 15, 12, 1, C.anvilDark)}
    </svg>
  );
}
