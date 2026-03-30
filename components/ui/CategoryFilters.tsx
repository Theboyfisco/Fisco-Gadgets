"use client";

import { useRouter, useSearchParams } from "next/navigation";

const FILTERS = [
  { label: "All", min: undefined, max: undefined },
  { label: "Under ₦200k", min: 0, max: 200000 },
  { label: "₦200k–₦500k", min: 200000, max: 500000 },
  { label: "₦500k+", min: 500000, max: undefined },
];

export function CategoryFilters({ initialMin, initialMax }: { initialMin?: number; initialMax?: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const min = searchParams.get("min") ?? (initialMin !== undefined ? String(initialMin) : null);
  const max = searchParams.get("max") ?? (initialMax !== undefined ? String(initialMax) : null);

  const handleSelect = (minValue?: number, maxValue?: number) => {
    const params = new URLSearchParams(searchParams);
    if (minValue !== undefined) {
      params.set("min", String(minValue));
    } else {
      params.delete("min");
    }
    if (maxValue !== undefined) {
      params.set("max", String(maxValue));
    } else {
      params.delete("max");
    }
    router.push(`?${params.toString()}`);
  };

  const isActive = (minValue?: number, maxValue?: number) => {
    const minMatch = minValue === undefined ? !min : min === String(minValue);
    const maxMatch = maxValue === undefined ? !max : max === String(maxValue);
    return minMatch && maxMatch;
  };

  const hasFilter = Boolean(min) || Boolean(max);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {FILTERS.map((filter) => {
        const active = isActive(filter.min, filter.max);
        return (
          <button
            key={filter.label}
            type="button"
            onClick={() => handleSelect(filter.min, filter.max)}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] transition-colors ${
              active
                ? "border-primary/40 bg-primary/15 text-primary"
                : "border-[var(--border-subtle)] bg-[var(--surface-card)] text-secondary hover:border-[var(--interactive-border-strong)] hover:text-[var(--foreground)]"
            }`}
          >
            {filter.label}
          </button>
        );
      })}
      {hasFilter && (
        <button
          type="button"
          onClick={() => handleSelect(undefined, undefined)}
          className="rounded-full border border-[var(--border-subtle)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-secondary transition-colors hover:border-[var(--interactive-border-strong)] hover:text-[var(--foreground)]"
        >
          Clear
        </button>
      )}
    </div>
  );
}
