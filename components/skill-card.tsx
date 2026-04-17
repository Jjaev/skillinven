import Link from "next/link";
import { getCategoryLabel, getCategoryTheme, getDisplayDescription } from "@/lib/skills";
import type { Skill } from "@/lib/types";

interface SkillCardProps {
  skill: Skill;
}

export function SkillCard({ skill }: SkillCardProps) {
  const description = getDisplayDescription(skill);
  const categoryLabel = getCategoryLabel(skill.category);
  const theme = getCategoryTheme(skill.category);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[8px] border border-[#F3F4F6] bg-white transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
      <div
        className="flex h-[140px] items-center justify-center border-b border-[#F3F4F6]"
        style={{ backgroundColor: theme.background }}
      >
        <SkillThumbnail icon={theme.icon} stroke={theme.stroke} />
      </div>

      <div className="flex flex-1 flex-col justify-between p-6">
        <div>
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="inline-flex rounded-full bg-[var(--surface-strong)] px-3 py-1 text-[11px] font-medium text-[var(--muted)]">
                {categoryLabel}
              </span>
            </div>
            <span className="rounded-full bg-[var(--surface-strong)] px-3 py-1 text-[11px] font-medium text-[var(--muted)]">
              {skill.description_ko && skill.is_reviewed ? "한국어" : "영문"}
            </span>
          </div>

          <h2 className="mt-5 text-[15px] font-semibold tracking-[-0.02em] text-[var(--foreground)]">
              {skill.name}
          </h2>
          <p className="mt-3 line-clamp-3 text-[13px] leading-[1.6] text-[#6B7280]">{description}</p>
        </div>

        <div className="mt-6">
          <div className="flex flex-wrap gap-2">
            {skill.compatible_with.map((agent) => (
              <span
                key={agent}
                className="rounded-full bg-[var(--surface-strong)] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--foreground)]"
              >
                {agent}
              </span>
            ))}
          </div>

          <div className="mt-8 flex items-center justify-between gap-4">
            <a
              href={skill.github_url}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-semibold text-[var(--foreground)]"
            >
              원본 GitHub
            </a>
            <Link
              href={`/skills/${skill.public_id}`}
              className="inline-flex items-center rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--foreground)]"
            >
              자세히 보기
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

function SkillThumbnail({
  icon,
  stroke
}: {
  icon: "code" | "document" | "spark";
  stroke: string;
}) {
  if (icon === "code") {
    return (
      <svg width="172" height="96" viewBox="0 0 148 84" fill="none" aria-hidden="true">
        <rect x="21" y="18" width="106" height="48" rx="16" stroke={stroke} strokeWidth="2.5" />
        <path d="M58 34L43 42L58 50" stroke={stroke} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M90 31L82 53" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
        <path d="M91 34L106 42L91 50" stroke={stroke} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="35" cy="29" r="2.5" fill={stroke} />
        <circle cx="44" cy="29" r="2.5" fill={stroke} opacity="0.55" />
      </svg>
    );
  }

  if (icon === "document") {
    return (
      <svg width="172" height="96" viewBox="0 0 148 84" fill="none" aria-hidden="true">
        <path d="M50 18H87L103 34V62C103 66.4183 99.4183 70 95 70H50C45.5817 70 42 66.4183 42 62V26C42 21.5817 45.5817 18 50 18Z" stroke={stroke} strokeWidth="2.5" />
        <path d="M87 18V30C87 34.4183 90.5817 38 95 38H103" stroke={stroke} strokeWidth="2.5" />
        <path d="M54 45H91" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
        <path d="M54 54H82" stroke={stroke} strokeWidth="3" strokeLinecap="round" opacity="0.8" />
      </svg>
    );
  }

  return (
    <svg width="172" height="96" viewBox="0 0 148 84" fill="none" aria-hidden="true">
      <path
        d="M74 17L80.9 31L96 33.2L85 43.9L87.6 59L74 51.8L60.4 59L63 43.9L52 33.2L67.1 31L74 17Z"
        stroke={stroke}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <circle cx="107" cy="24" r="4" fill={stroke} opacity="0.65" />
      <circle cx="42" cy="57" r="3.5" fill={stroke} opacity="0.55" />
    </svg>
  );
}
