import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getCategoryLabel,
  getDisplayDescription,
  getDisplayName,
  getDisplayOriginalName,
  getSkillByPublicId
} from "@/lib/skills";

interface SkillDetailPageProps {
  params: Promise<{
    publicId: string;
  }>;
}

export default async function SkillDetailPage({ params }: SkillDetailPageProps) {
  const { publicId } = await params;
  const skill = await getSkillByPublicId(publicId);

  if (!skill) {
    notFound();
  }

  const description = getDisplayDescription(skill);
  const categoryLabel = getCategoryLabel(skill.category);
  const displayName = getDisplayName(skill);
  const originalName = getDisplayOriginalName(skill);
  const showOriginalName = displayName !== originalName;

  return (
    <main className="pb-16 pt-6 md:pb-24 md:pt-8">
      <div className="page-shell">
        <section className="border-b border-[var(--border)] pb-6">
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/"
              className="text-sm font-semibold text-[var(--muted)] underline-offset-4 hover:underline"
            >
              홈으로 돌아가기
            </Link>
            <a
              href={skill.github_url}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-semibold text-[var(--muted)] underline-offset-4 hover:underline"
            >
              원본 보기
            </a>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-[28px] border border-[var(--border)] bg-[linear-gradient(180deg,#fbfbfa_0%,#f6f6f4_100%)] p-7 md:p-10">
            <div className="max-w-3xl">
              <p className="text-sm font-medium text-[var(--muted)]">{categoryLabel}</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-[-0.06em] md:text-5xl">
                {displayName}
              </h1>
              {showOriginalName ? (
                <p className="mt-3 text-[13px] font-medium text-[#9CA3AF]">{originalName}</p>
              ) : null}
              <p className="mt-5 text-base leading-8 text-[var(--muted)]">{description}</p>
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              {skill.compatible_with.map((agent) => (
                <span
                  key={agent}
                  className="rounded-full border border-[var(--border)] bg-white px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em]"
                >
                  {agent}
                </span>
              ))}
            </div>
          </article>

          <aside className="grid gap-4">
            <section className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-6">
              <p className="text-sm font-medium text-[var(--muted)]">표시 언어</p>
              <p className="mt-3 text-xl font-semibold tracking-[-0.03em]">
                {skill.description_ko && skill.is_reviewed ? "검수된 한국어 설명" : "영문 fallback 설명"}
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                한국어 번역이 있고 검수가 끝난 스킬만 한국어로 보여줍니다.
              </p>
            </section>

            <section className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-6">
              <h2 className="text-xl font-semibold tracking-[-0.03em]">호환 에이전트</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {skill.compatible_with.map((agent) => (
                  <span
                    key={agent}
                    className="rounded-full border border-[var(--border)] bg-white px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em]"
                  >
                    {agent}
                  </span>
                ))}
              </div>
            </section>
          </aside>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-[28px] border border-[var(--border)] bg-white p-7">
            <h2 className="text-2xl font-semibold tracking-[-0.04em]">설치 방법</h2>
            <div className="mt-5 overflow-x-auto rounded-[22px] border border-[var(--border)] bg-[var(--surface-strong)] p-5 text-sm text-[var(--foreground)]">
              <pre className="whitespace-pre-wrap">
                <code>{`# Claude Code에서
/plugin install ${skill.public_id}@anthropic-agent-skills

# 원본 저장소
${skill.github_url}`}</code>
              </pre>
            </div>
          </article>

          <aside className="rounded-[28px] border border-[var(--border)] bg-white p-7">
            <h2 className="text-2xl font-semibold tracking-[-0.04em]">원본 정보</h2>
            <dl className="mt-5 space-y-4 text-sm text-[var(--muted)]">
              <div>
                <dt className="font-semibold text-[var(--foreground)]">저장소</dt>
                <dd className="mt-1">{skill.source_repo}</dd>
              </div>
              <div>
                <dt className="font-semibold text-[var(--foreground)]">경로</dt>
                <dd className="mt-1 break-all">{skill.source_path}</dd>
              </div>
              <div>
                <dt className="font-semibold text-[var(--foreground)]">업데이트</dt>
                <dd className="mt-1">
                  {new Intl.DateTimeFormat("ko-KR", {
                    dateStyle: "medium"
                  }).format(new Date(skill.updated_at))}
                </dd>
              </div>
            </dl>
            <a
              href={skill.github_url}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold transition hover:border-[var(--foreground)]"
            >
              GitHub 원문 보기
            </a>
          </aside>
        </section>
      </div>
    </main>
  );
}
