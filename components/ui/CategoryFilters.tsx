"use client";

import { useRouter, useSearchParams } from "next/navigation";

const PRICE_FILTERS = [
  { label: "All", min: undefined, max: undefined },
  { label: "Under ₦200k", min: 0, max: 200000 },
  { label: "₦200k–₦500k", min: 200000, max: 500000 },
  { label: "₦500k+", min: 500000, max: undefined },
];

function normalizeSpecValue(value: string) {
  return value.trim().toLowerCase();
}

export function CategoryFilters({
  initialMin,
  initialMax,
  brandOptions = [],
  ramOptions = [],
  storageOptions = [],
}: {
  initialMin?: number;
  initialMax?: number;
  brandOptions?: Array<{ id: string; name: string }>;
  ramOptions?: string[];
  storageOptions?: string[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const min = searchParams.get("min") ?? (initialMin !== undefined ? String(initialMin) : null);
  const max = searchParams.get("max") ?? (initialMax !== undefined ? String(initialMax) : null);
  const brand = searchParams.get("brand") ?? "";
  const condition = searchParams.get("condition") ?? "";
  const stock = searchParams.get("stock") ?? "";
  const ram = searchParams.get("ram") ?? "";
  const storage = searchParams.get("storage") ?? "";

  const updateParams = (entries: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(entries).forEach(([key, value]) => {
      const normalized = value?.trim();
      if (normalized) {
        params.set(key, normalized);
      } else {
        params.delete(key);
      }
    });
    router.push(`?${params.toString()}`);
  };

  const handlePriceSelect = (minValue?: number, maxValue?: number) => {
    updateParams({
      min: minValue !== undefined ? String(minValue) : undefined,
      max: maxValue !== undefined ? String(maxValue) : undefined,
    });
  };

  const isPriceActive = (minValue?: number, maxValue?: number) => {
    const minMatch = minValue === undefined ? !min : min === String(minValue);
    const maxMatch = maxValue === undefined ? !max : max === String(maxValue);
    return minMatch && maxMatch;
  };

  const hasFilter = Boolean(min) || Boolean(max) || Boolean(brand) || Boolean(condition) || Boolean(stock) || Boolean(ram) || Boolean(storage);

  return (
    <div className="flex flex-col gap-2 rounded-[1.5rem] border border-[var(--border-subtle)] bg-[var(--surface-soft)] p-2">
      <div className="flex flex-wrap items-center gap-2">
        {PRICE_FILTERS.map((filter) => {
          const active = isPriceActive(filter.min, filter.max);
          return (
            <button
              key={filter.label}
              type="button"
              onClick={() => handlePriceSelect(filter.min, filter.max)}
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
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        <select
          value={brand}
          onChange={(event) => updateParams({ brand: event.target.value || undefined })}
          className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--foreground)] outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
        >
          <option value="" className="bg-[var(--panel-bg)] text-[var(--foreground)]">
            Brand: All
          </option>
          {brandOptions.map((item) => (
            <option key={item.id} value={item.id} className="bg-[var(--panel-bg)] text-[var(--foreground)]">
              {item.name}
            </option>
          ))}
        </select>

        <select
          value={condition}
          onChange={(event) => updateParams({ condition: event.target.value || undefined })}
          className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--foreground)] outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
        >
          <option value="" className="bg-[var(--panel-bg)] text-[var(--foreground)]">
            Condition: All
          </option>
          <option value="NEW" className="bg-[var(--panel-bg)] text-[var(--foreground)]">
            New
          </option>
          <option value="OPEN_BOX" className="bg-[var(--panel-bg)] text-[var(--foreground)]">
            Open Box
          </option>
          <option value="REFURBISHED" className="bg-[var(--panel-bg)] text-[var(--foreground)]">
            Refurbished
          </option>
        </select>

        <select
          value={stock}
          onChange={(event) => updateParams({ stock: event.target.value || undefined })}
          className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--foreground)] outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
        >
          <option value="" className="bg-[var(--panel-bg)] text-[var(--foreground)]">
            Stock: Any
          </option>
          <option value="in" className="bg-[var(--panel-bg)] text-[var(--foreground)]">
            In stock
          </option>
          <option value="low" className="bg-[var(--panel-bg)] text-[var(--foreground)]">
            Low stock
          </option>
        </select>

        <select
          value={ram}
          onChange={(event) => updateParams({ ram: normalizeSpecValue(event.target.value) || undefined })}
          className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--foreground)] outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
        >
          <option value="" className="bg-[var(--panel-bg)] text-[var(--foreground)]">
            RAM: Any
          </option>
          {ramOptions.map((value) => (
            <option key={value} value={value} className="bg-[var(--panel-bg)] text-[var(--foreground)]">
              {value}
            </option>
          ))}
        </select>

        <select
          value={storage}
          onChange={(event) => updateParams({ storage: normalizeSpecValue(event.target.value) || undefined })}
          className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--foreground)] outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
        >
          <option value="" className="bg-[var(--panel-bg)] text-[var(--foreground)]">
            Storage: Any
          </option>
          {storageOptions.map((value) => (
            <option key={value} value={value} className="bg-[var(--panel-bg)] text-[var(--foreground)]">
              {value}
            </option>
          ))}
        </select>
      </div>

      {hasFilter && (
        <button
          type="button"
          onClick={() =>
            updateParams({
              min: undefined,
              max: undefined,
              brand: undefined,
              condition: undefined,
              stock: undefined,
              ram: undefined,
              storage: undefined,
            })
          }
          className="w-fit rounded-full border border-[var(--border-subtle)] bg-[var(--surface-card)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-secondary transition-colors hover:border-[var(--interactive-border-strong)] hover:text-[var(--foreground)]"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}
