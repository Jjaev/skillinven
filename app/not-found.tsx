import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="glass-panel max-w-xl rounded-[32px] p-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">
          404
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">스킬을 찾을 수 없습니다</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
          공개 ID 기준으로 찾지 못했습니다. 홈에서 이름 검색으로 다시 확인해보세요.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-full bg-[var(--foreground)] px-5 py-3 text-sm font-semibold text-white"
        >
          홈으로 이동
        </Link>
      </div>
    </main>
  );
}
