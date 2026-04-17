"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function SearchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams?.get("q") ?? "");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const params = new URLSearchParams(searchParams?.toString() ?? "");

    if (value.trim()) {
      params.set("q", value.trim());
    } else {
      params.delete("q");
    }

    router.push(`/?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full items-center gap-3 rounded-[18px] border border-[var(--border)] bg-white px-4 py-3 shadow-[0_8px_24px_rgba(15,23,42,0.06)]"
    >
      <label htmlFor="skill-search" className="sr-only">
        스킬 이름 검색
      </label>
      <input
        id="skill-search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="스킬 이름으로 검색..."
        className="min-h-11 flex-1 bg-transparent text-[15px] text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]"
      />
      <button
        type="submit"
        className="min-h-11 rounded-full bg-[var(--foreground)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--foreground-strong)]"
      >
        검색
      </button>
    </form>
  );
}
