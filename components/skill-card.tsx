import Link from "next/link";
import {
  getCategoryLabel,
  getCategoryTheme,
  getDisplayDescription,
  getDisplayName,
  getDisplayOriginalName,
  getSkillIcon
} from "@/lib/skills";
import type { Skill } from "@/lib/types";
import { Code2, FileText, Fingerprint, Palette, Sparkles, Zap } from "lucide-react";

interface SkillCardProps {
  skill: Skill;
}

export function SkillCard({ skill }: SkillCardProps) {
  const description = getDisplayDescription(skill);
  const categoryLabel = getCategoryLabel(skill.category);
  const theme = getCategoryTheme(skill.category);
  const displayName = getDisplayName(skill);
  const originalName = getDisplayOriginalName(skill);
  const icon = getSkillIcon(skill);
  const showOriginalName = displayName !== originalName;
  const showLanguageBadge = !(skill.description_ko && skill.is_reviewed);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[8px] border border-[var(--border)] bg-white transition duration-200 hover:shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
      <Link href={`/skills/${skill.public_id}`} className="flex h-full flex-col">
        <div
          className="flex h-[120px] items-center justify-center border-b border-[var(--border)]"
          style={{ backgroundColor: theme.background }}
        >
          <SkillThumbnail icon={icon} stroke={theme.stroke} />
        </div>

        <div className="flex flex-1 flex-col justify-between p-5">
          <div>
            <div className="flex items-start justify-between gap-3">
              <span className="inline-flex rounded-full bg-[var(--surface-strong)] px-2.5 py-1 text-[11px] font-medium text-[var(--muted)]">
                {categoryLabel}
              </span>
              {showLanguageBadge ? (
                <span className="text-[11px] font-medium text-[#D1D5DB]">영문</span>
              ) : null}
            </div>

            <h2 className="mt-4 text-[15px] font-semibold leading-6 text-[var(--foreground)]">
              {displayName}
            </h2>
            {showOriginalName ? (
              <p className="mt-1 text-[11px] leading-4 text-[#9CA3AF]">{originalName}</p>
            ) : null}
            <p className="mt-2.5 line-clamp-3 text-[13px] font-normal leading-[1.6] text-[#6B7280]">
              {description}
            </p>
          </div>

          <div className="mt-5">
            <div className="flex flex-wrap gap-2">
              {skill.compatible_with.map((agent) => (
                <span
                  key={agent}
                  className="rounded-full bg-[var(--surface-strong)] px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--foreground)]"
                >
                  {agent}
                </span>
              ))}
            </div>

            <div className="mt-6">
              <span className="inline-flex h-8 items-center rounded-[6px] border border-[var(--border)] px-3 text-[13px] font-medium text-[var(--foreground)] transition hover:border-[var(--foreground)]">
                자세히 보기
              </span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}

function SkillThumbnail({
  icon,
  stroke
}: {
  icon: "code" | "file-text" | "sparkles" | "palette" | "zap" | "fingerprint";
  stroke: string;
}) {
  const iconClassName = "h-9 w-9";

  if (icon === "code") return <Code2 className={iconClassName} color={stroke} strokeWidth={2.2} />;
  if (icon === "file-text") return <FileText className={iconClassName} color={stroke} strokeWidth={2.2} />;
  if (icon === "palette") return <Palette className={iconClassName} color={stroke} strokeWidth={2.2} />;
  if (icon === "zap") return <Zap className={iconClassName} color={stroke} strokeWidth={2.2} />;
  if (icon === "fingerprint") return <Fingerprint className={iconClassName} color={stroke} strokeWidth={2.2} />;
  return <Sparkles className={iconClassName} color={stroke} strokeWidth={2.2} />;
}
