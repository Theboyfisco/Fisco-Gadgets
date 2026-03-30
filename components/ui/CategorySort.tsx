"use client";

import { useRouter, useSearchParams } from "next/navigation";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

export function CategorySort() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("sort") ?? "newest";

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("sort", value);
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="category-sort" className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-soft)]">
        Sort
      </label>
      <select
        id="category-sort"
        value={current}
        onChange={(event) => handleChange(event.target.value)}
        className="interactive-focus rounded-full border border-[var(--interactive-border)] bg-[var(--surface-card)] px-3 py-1.5 text-sm font-medium text-[var(--foreground)] transition-colors hover:border-[var(--interactive-border-strong)]"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
