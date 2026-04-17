import Link from "next/link";
import { SearchForm } from "@/components/search-form";
import { SkillCard } from "@/components/skill-card";
import {
  getCategoryLabel,
  getCategoryTheme,
  getFilteredSkills,
  getSkillCategories
} from "@/lib/skills";

interface HomePageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
  }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const skills = await getFilteredSkills(params.q, params.category);
  const categories = await getSkillCategories();
  const hasQuery = Boolean(params.q?.trim() || params.category?.trim());
  const selectedCategory = params.category?.trim() || "all";
  const allSkills = await getFilteredSkills(undefined, undefined);
  const categorySummary = categories.map((category) => ({
    key: category,
    label: getCategoryLabel(category),
    count: allSkills.filter((skill) => (skill.category ?? "uncategorized") === category).length,
    theme: getCategoryTheme(category)
  }));

  return (
    <main className="pb-16 pt-0 md:pb-24">
      <div className="page-shell">
        <section className="flex min-h-14 items-center border-b border-[var(--border)] bg-white">
          <div className="flex w-full items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-[12px] border border-[var(--border)] bg-[var(--surface)] text-base font-semibold">
                스
              </div>
              <div>
                <p className="text-base font-semibold">스킬인벤</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12">
          <p className="text-xs font-medium tracking-[0.01em] text-[var(--muted)]">
            스킬 마켓플레이스
          </p>
          <h1 className="mt-4 max-w-4xl text-[28px] font-bold leading-[1.3] tracking-[-0.04em]">
            한국 개발자를 위한 Claude Code 스킬 모음
          </h1>
          <p className="mt-4 max-w-3xl text-[15px] leading-7 text-[var(--muted)]">
            공식 SKILL.md 기반으로 정리한 스킬 인벤토리입니다. 한국어 번역이 있고 검수 완료된
            스킬은 한국어로, 아니면 영문 원문으로 보여줍니다.
          </p>
          <div className="mt-6 max-w-[560px]">
            <SearchForm />
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {categorySummary.map((category) => (
            <Link
              key={category.key}
              href={`/?category=${encodeURIComponent(category.key)}`}
              className="rounded-[20px] border border-[var(--border)] bg-[var(--surface-strong)] p-6 transition hover:shadow-[var(--shadow)]"
            >
              <div
                className="flex h-11 w-11 items-center justify-center rounded-[14px]"
                style={{ backgroundColor: category.theme.background }}
              >
                <CategoryIcon icon={category.theme.icon} stroke={category.theme.stroke} />
              </div>
              <p className="mt-5 text-lg font-semibold tracking-[-0.03em]">{category.label}</p>
              <p className="mt-2 text-sm text-[var(--muted)]">{category.count}개 스킬</p>
            </Link>
          ))}
        </section>

        <section className="mt-12">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-[2rem] font-semibold tracking-[-0.04em]">스킬 둘러보기</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                카테고리로 좁혀보거나 이름으로 빠르게 찾을 수 있습니다.
              </p>
            </div>
            <Link
              href="/"
              className="text-sm font-semibold text-[var(--foreground)] underline-offset-4 hover:underline"
            >
              필터 초기화
            </Link>
          </div>
        </section>

        <section className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/"
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              selectedCategory === "all"
                ? "border-[var(--foreground)] bg-[var(--foreground)] text-white"
                : "border-[var(--border)] bg-white text-[var(--foreground)] hover:border-[var(--foreground)]"
            }`}
          >
            전체
          </Link>
          {categories.map((category) => (
            <Link
              key={category}
              href={`/?category=${encodeURIComponent(category)}`}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                selectedCategory === category
                  ? "border-[var(--foreground)] bg-[var(--foreground)] text-white"
                  : "border-[var(--border)] bg-white text-[var(--foreground)] hover:border-[var(--foreground)]"
              }`}
            >
              {getCategoryLabel(category)}
            </Link>
          ))}
        </section>

        {skills.length === 0 ? (
          <section className="mt-8 rounded-[28px] border border-[var(--border)] bg-[var(--surface-strong)] p-10 text-center">
            <h3 className="text-2xl font-semibold tracking-[-0.03em]">
              {hasQuery ? "검색 결과가 없어요" : "아직 등록된 스킬이 없어요"}
            </h3>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              {hasQuery
                ? "다른 검색어를 입력하거나 카테고리 필터를 변경해보세요."
                : "초기 데이터가 준비되면 이 영역에 스킬 카드가 표시됩니다."}
            </p>
          </section>
        ) : (
        <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {skills.map((skill) => (
            <SkillCard key={skill.source_id} skill={skill} />
          ))}
          </section>
        )}
      </div>
    </main>
  );
}

function CategoryIcon({
  icon,
  stroke
}: {
  icon: "code" | "document" | "spark";
  stroke: string;
}) {
  if (icon === "code") {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M9 7L4 12L9 17" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15 7L20 12L15 17" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (icon === "document") {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M8 3H13L18 8V18C18 19.1046 17.1046 20 16 20H8C6.89543 20 6 19.1046 6 18V5C6 3.89543 6.89543 3 8 3Z" stroke={stroke} strokeWidth="2" />
        <path d="M13 3V7C13 8.10457 13.8954 9 15 9H18" stroke={stroke} strokeWidth="2" />
      </svg>
    );
  }

  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3L14.5 8.2L20 9L16 12.9L17 18.5L12 15.8L7 18.5L8 12.9L4 9L9.5 8.2L12 3Z" stroke={stroke} strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}
