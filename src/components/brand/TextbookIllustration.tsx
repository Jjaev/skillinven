interface Props {
  className?: string;
}

/**
 * Flat-style open textbook illustration with code lines, sparkles, and a pencil.
 * Uses lavender/amber palette to match site gradients.
 */
export function TextbookIllustration({ className }: Props) {
  return (
    <svg
      viewBox="0 0 320 240"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="펼쳐진 교과서 일러스트"
    >
      <defs>
        <linearGradient id="bookLeft" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="oklch(0.94 0.05 290)" />
          <stop offset="100%" stopColor="oklch(0.86 0.10 290)" />
        </linearGradient>
        <linearGradient id="bookRight" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="oklch(0.96 0.04 290)" />
          <stop offset="100%" stopColor="oklch(0.88 0.09 290)" />
        </linearGradient>
        <linearGradient id="spine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.55 0.18 290)" />
          <stop offset="100%" stopColor="oklch(0.45 0.20 290)" />
        </linearGradient>
      </defs>

      {/* Soft shadow under book */}
      <ellipse cx="160" cy="210" rx="120" ry="10" fill="oklch(0.55 0.18 290)" opacity="0.12" />

      {/* Sparkles */}
      <g fill="oklch(0.82 0.16 70)">
        <path d="M50 60 L53 68 L61 71 L53 74 L50 82 L47 74 L39 71 L47 68 Z" opacity="0.9" />
        <path d="M280 50 L282 56 L288 58 L282 60 L280 66 L278 60 L272 58 L278 56 Z" opacity="0.85" />
      </g>
      <g fill="oklch(0.65 0.20 350)">
        <path d="M270 130 L272 135 L277 137 L272 139 L270 144 L268 139 L263 137 L268 135 Z" opacity="0.8" />
        <circle cx="42" cy="140" r="2.5" opacity="0.7" />
      </g>

      {/* Left page */}
      <path
        d="M40 70 Q40 65 45 65 L155 65 Q160 70 160 80 L160 195 Q155 192 150 192 L45 192 Q40 192 40 187 Z"
        fill="url(#bookLeft)"
        stroke="oklch(0.45 0.15 290)"
        strokeWidth="1.5"
      />
      {/* Right page */}
      <path
        d="M280 70 Q280 65 275 65 L165 65 Q160 70 160 80 L160 195 Q165 192 170 192 L275 192 Q280 192 280 187 Z"
        fill="url(#bookRight)"
        stroke="oklch(0.45 0.15 290)"
        strokeWidth="1.5"
      />
      {/* Spine shadow */}
      <rect x="158" y="68" width="4" height="125" fill="url(#spine)" opacity="0.3" />

      {/* Left page: code lines */}
      <g stroke="oklch(0.55 0.18 290)" strokeWidth="2" strokeLinecap="round" opacity="0.55">
        <line x1="55" y1="88" x2="75" y2="88" />
        <line x1="80" y1="88" x2="115" y2="88" />
        <line x1="60" y1="100" x2="90" y2="100" />
        <line x1="95" y1="100" x2="140" y2="100" />
        <line x1="55" y1="112" x2="100" y2="112" />
        <line x1="105" y1="112" x2="125" y2="112" />
      </g>
      {/* Left page: code block */}
      <rect x="55" y="128" width="90" height="46" rx="4" fill="oklch(0.20 0.02 280)" opacity="0.92" />
      <g stroke="oklch(0.85 0.16 70)" strokeWidth="1.6" strokeLinecap="round" opacity="0.9">
        <line x1="62" y1="138" x2="80" y2="138" />
      </g>
      <g stroke="oklch(0.75 0.15 180)" strokeWidth="1.6" strokeLinecap="round" opacity="0.85">
        <line x1="84" y1="138" x2="110" y2="138" />
        <line x1="62" y1="148" x2="92" y2="148" />
      </g>
      <g stroke="oklch(0.95 0.02 280)" strokeWidth="1.6" strokeLinecap="round" opacity="0.7">
        <line x1="68" y1="158" x2="100" y2="158" />
        <line x1="62" y1="168" x2="88" y2="168" />
      </g>

      {/* Right page: AI heading */}
      <text
        x="220"
        y="92"
        textAnchor="middle"
        fontFamily="ui-monospace, monospace"
        fontSize="13"
        fontWeight="700"
        fill="oklch(0.45 0.18 290)"
      >
        AI
      </text>
      <line x1="195" y1="100" x2="245" y2="100" stroke="oklch(0.55 0.18 290)" strokeWidth="1.2" opacity="0.5" />
      {/* Right page: text lines */}
      <g stroke="oklch(0.55 0.18 290)" strokeWidth="2" strokeLinecap="round" opacity="0.55">
        <line x1="175" y1="115" x2="220" y2="115" />
        <line x1="225" y1="115" x2="265" y2="115" />
        <line x1="175" y1="127" x2="240" y2="127" />
        <line x1="245" y1="127" x2="265" y2="127" />
        <line x1="175" y1="139" x2="210" y2="139" />
      </g>
      {/* Right page: highlighted block */}
      <rect x="175" y="152" width="90" height="14" rx="3" fill="oklch(0.85 0.16 70)" opacity="0.35" />
      <line x1="180" y1="159" x2="245" y2="159" stroke="oklch(0.50 0.18 70)" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      <g stroke="oklch(0.55 0.18 290)" strokeWidth="2" strokeLinecap="round" opacity="0.55">
        <line x1="175" y1="176" x2="225" y2="176" />
        <line x1="175" y1="188" x2="200" y2="188" />
      </g>

      {/* Pencil — diagonal across right-bottom */}
      <g transform="translate(225 175) rotate(35)">
        {/* Body */}
        <rect x="0" y="-4" width="50" height="8" rx="1" fill="oklch(0.85 0.16 70)" stroke="oklch(0.45 0.15 70)" strokeWidth="1" />
        {/* Tip */}
        <polygon points="50,-4 62,0 50,4" fill="oklch(0.92 0.04 80)" stroke="oklch(0.45 0.15 70)" strokeWidth="1" />
        <polygon points="58,-1.3 62,0 58,1.3" fill="oklch(0.20 0.02 280)" />
        {/* Eraser */}
        <rect x="-10" y="-4" width="10" height="8" rx="1" fill="oklch(0.65 0.20 350)" stroke="oklch(0.40 0.18 350)" strokeWidth="1" />
        {/* Metal band */}
        <rect x="-2" y="-4" width="3" height="8" fill="oklch(0.55 0.18 290)" />
      </g>

      {/* Tiny star bottom-left */}
      <path
        d="M60 200 L62 205 L67 207 L62 209 L60 214 L58 209 L53 207 L58 205 Z"
        fill="oklch(0.82 0.16 70)"
        opacity="0.75"
      />
    </svg>
  );
}
