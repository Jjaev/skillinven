import Link from "next/link";
import { Code2, FileText, Palette, Sparkles, Zap } from "lucide-react";
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
      <header className="site-header">
        <div className="page-shell flex h-14 items-center">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-[var(--border)] bg-[var(--surface)] text-sm font-semibold">
              스
            </div>
            <span className="text-[15px] font-semibold text-[var(--foreground)]">스킬인벤</span>
          </Link>
        </div>
      </header>

      <div className="page-shell">
        <section className="py-10 md:py-12">
          <div className="max-w-[720px]">
            <p className="text-[13px] font-medium text-[var(--muted)]">Claude Code skill library</p>
            <h1 className="mt-3 text-[28px] font-bold leading-[1.25] tracking-[-0.03em] text-[var(--foreground)]">
              한국 개발자를 위한 Claude Code 스킬 인벤토리
            </h1>
            <p className="mt-4 max-w-[640px] text-[15px] leading-7 text-[var(--muted)]">
              공식 스킬과 curated skill을 한곳에 정리했습니다. 검수된 한국어 설명은 한국어로,
              그 외 스킬은 영어 원문으로 그대로 보여줍니다.
            </p>
          </div>

          <div className="mt-7 max-w-[640px]">
            <SearchForm />
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {categorySummary.slice(0, 3).map((category) => (
              <Link
                key={category.key}
                href={`/?category=${encodeURIComponent(category.key)}`}
                className="rounded-[8px] border border-[var(--border)] bg-[var(--surface)] px-5 py-4 transition hover:shadow-[var(--shadow)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[13px] font-medium text-[var(--muted)]">카테고리</p>
                    <p className="mt-2 text-[18px] font-semibold leading-7 tracking-[-0.02em]">
                      {category.label}
                    </p>
                    <p className="mt-1 text-[13px] text-[var(--muted)]">{category.count}개 스킬</p>
                  </div>
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-[8px]"
                    style={{ backgroundColor: category.theme.background }}
                  >
                    <CategoryIcon icon={category.theme.icon} stroke={category.theme.stroke} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="border-t border-[var(--border)] pt-8 md:pt-10">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-[24px] font-semibold tracking-[-0.03em] text-[var(--foreground)]">
                스킬 둘러보기
              </h2>
              <p className="mt-2 text-[14px] leading-6 text-[var(--muted)]">
                카테고리 필터와 이름 검색으로 원하는 스킬만 빠르게 볼 수 있습니다.
              </p>
            </div>
            <Link
              href="/"
              className="text-[13px] font-medium text-[var(--foreground)] underline-offset-4 hover:underline"
            >
              필터 초기화
            </Link>
          </div>
        </section>

        <section className="mt-5 flex flex-wrap gap-2">
          <Link
            href="/"
            className={`inline-flex h-9 items-center rounded-full border px-4 text-sm font-medium transition ${
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
              className={`inline-flex h-9 items-center rounded-full border px-4 text-sm font-medium transition ${
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
          <section className="mt-8 rounded-[8px] border border-[var(--border)] bg-[var(--surface)] p-10 text-center">
            <h3 className="text-[24px] font-semibold tracking-[-0.03em]">
              {hasQuery ? "검색 결과가 없어요" : "아직 등록된 스킬이 없어요"}
            </h3>
            <p className="mt-3 text-[14px] leading-6 text-[var(--muted)]">
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
  icon: "code" | "file-text" | "sparkles" | "palette" | "zap";
  stroke: string;
}) {
  const className = "h-5 w-5";

  if (icon === "code") return <Code2 className={className} color={stroke} strokeWidth={2.2} />;
  if (icon === "file-text") return <FileText className={className} color={stroke} strokeWidth={2.2} />;
  if (icon === "palette") return <Palette className={className} color={stroke} strokeWidth={2.2} />;
  if (icon === "zap") return <Zap className={className} color={stroke} strokeWidth={2.2} />;
  return <Sparkles className={className} color={stroke} strokeWidth={2.2} />;
}
