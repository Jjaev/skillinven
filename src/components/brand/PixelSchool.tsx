/**
 * Pixel-art school scene: brick building, two windows, roof, a tree, and a
 * walking student carrying a book. Muted tones to blend with the background.
 */
interface PixelSchoolProps {
  className?: string;
}

const C = {
  // Building
  brickDark: '#7a5544',
  brick: '#9a6f5a',
  brickLight: '#b08773',
  roof: '#5a3a30',
  roofLight: '#7a5040',
  window: '#c8d8e8',
  windowFrame: '#3a3530',
  door: '#5a3a25',
  // Tree
  trunk: '#6b4a2a',
  leafDark: '#5a8a5c',
  leaf: '#7da77f',
  // Character (student)
  hair: '#3a2a1a',
  skin: '#e8c7a8',
  shirt: '#a8b8d8',
  pants: '#4a5a7a',
  book: '#c87060',
  // Ground
  ground: '#8a7a5a',
};

export function PixelSchool({ className }: PixelSchoolProps) {
  // 32 wide x 18 tall grid, each cell = 6 SVG units → 192x108 viewBox
  const px = (x: number, y: number, w: number, h: number, fill: string) => (
    <rect key={`${x}-${y}-${w}-${h}-${fill}`} x={x * 6} y={y * 6} width={w * 6} height={h * 6} fill={fill} />
  );

  return (
    <svg
      viewBox="0 0 192 108"
      className={className}
      style={{ shapeRendering: 'crispEdges' }}
      aria-hidden="true"
    >
      {/* Ground line */}
      {px(0, 16, 32, 2, C.ground)}

      {/* Tree (right side) */}
      {px(27, 11, 1, 5, C.trunk)}
      {px(25, 8, 5, 1, C.leafDark)}
      {px(24, 9, 7, 2, C.leaf)}
      {px(25, 11, 5, 1, C.leafDark)}

      {/* School building base (cols 8-22, rows 6-16) */}
      {/* Roof */}
      {px(7, 4, 17, 1, C.roof)}
      {px(6, 5, 19, 1, C.roofLight)}
      {px(7, 6, 17, 1, C.roof)}
      {/* Walls */}
      {px(8, 7, 15, 9, C.brick)}
      {/* Brick texture */}
      {px(8, 8, 15, 1, C.brickDark)}
      {px(8, 11, 15, 1, C.brickDark)}
      {px(8, 14, 15, 1, C.brickDark)}
      {px(10, 7, 1, 9, C.brickLight)}
      {px(20, 7, 1, 9, C.brickLight)}

      {/* Windows */}
      {px(10, 9, 3, 2, C.windowFrame)}
      {px(11, 9, 1, 2, C.window)}
      {px(12, 9, 1, 2, C.window)}
      {px(10, 9, 3, 1, C.window)}
      {px(11, 10, 1, 1, C.windowFrame)}

      {px(18, 9, 3, 2, C.windowFrame)}
      {px(19, 9, 1, 2, C.window)}
      {px(20, 9, 1, 2, C.window)}
      {px(18, 9, 3, 1, C.window)}
      {px(19, 10, 1, 1, C.windowFrame)}

      {/* Door */}
      {px(14, 12, 3, 4, C.door)}
      {px(15, 13, 1, 1, C.brickLight)}

      {/* Sign on roof — small lavender accent */}
      {px(14, 5, 3, 1, '#b8a0d8')}

      {/* Walking student (left side, heading to school) */}
      {/* Head */}
      {px(3, 11, 2, 2, C.skin)}
      {px(3, 11, 2, 1, C.hair)}
      {/* Body */}
      {px(3, 13, 2, 2, C.shirt)}
      {/* Legs (stride) */}
      {px(3, 15, 1, 1, C.pants)}
      {px(4, 15, 1, 1, C.pants)}
      {/* Book in hand (forward) */}
      {px(5, 13, 1, 2, C.book)}
      {px(5, 13, 1, 1, '#fff5e0')}
    </svg>
  );
}
