"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Save, Trash2 } from "lucide-react";
import {
  createBrand,
  createCategory,
  deleteBrand,
  deleteCategory,
  updateBrand,
  updateCategory,
} from "@/actions/admin-taxonomy";
import { useToast } from "@/components/ui/ToastProvider";

type CategoryItem = {
  id: string;
  name: string;
  slug: string;
  image: string;
};

type BrandItem = {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
};

type TaxonomyConsoleProps = {
  categories: CategoryItem[];
  brands: BrandItem[];
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function CatalogTaxonomyConsole({ categories, brands }: TaxonomyConsoleProps) {
  const router = useRouter();
  const { pushToast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [categoryId, setCategoryId] = useState<string | null>(categories[0]?.id ?? null);
  const [brandId, setBrandId] = useState<string | null>(brands[0]?.id ?? null);
  const [categoryDraft, setCategoryDraft] = useState(() => ({
    name: categories[0]?.name ?? "",
    slug: categories[0]?.slug ?? "",
    image: categories[0]?.image ?? "",
  }));
  const [brandDraft, setBrandDraft] = useState(() => ({
    name: brands[0]?.name ?? "",
    slug: brands[0]?.slug ?? "",
    image: brands[0]?.image ?? "",
  }));
  const [categoryErrors, setCategoryErrors] = useState<{ name?: string; slug?: string; image?: string }>({});
  const [brandErrors, setBrandErrors] = useState<{ name?: string; slug?: string; image?: string }>({});

  const selectedCategory = useMemo(() => categories.find((item) => item.id === categoryId) ?? null, [categories, categoryId]);
  const selectedBrand = useMemo(() => brands.find((item) => item.id === brandId) ?? null, [brands, brandId]);

  const validateCategory = () => {
    const errors: { name?: string; slug?: string; image?: string } = {};
    if (categoryDraft.name.trim().length < 2) errors.name = "Category name is required.";
    if (slugify(categoryDraft.slug || categoryDraft.name).length < 2) errors.slug = "Slug is required.";
    if (!/^https?:\/\/.+/i.test(categoryDraft.image.trim())) errors.image = "Image URL must be valid.";
    setCategoryErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateBrand = () => {
    const errors: { name?: string; slug?: string; image?: string } = {};
    if (brandDraft.name.trim().length < 2) errors.name = "Brand name is required.";
    if (slugify(brandDraft.slug || brandDraft.name).length < 2) errors.slug = "Slug is required.";
    if (brandDraft.image.trim() && !/^https?:\/\/.+/i.test(brandDraft.image.trim())) errors.image = "Image URL must be valid.";
    setBrandErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const saveCategory = (createNew = false) => {
    if (!validateCategory()) return;
    startTransition(async () => {
      const payload = {
        name: categoryDraft.name.trim(),
        slug: slugify(categoryDraft.slug || categoryDraft.name),
        image: categoryDraft.image.trim(),
      };
      const result = createNew || !categoryId ? await createCategory(payload) : await updateCategory(categoryId, payload);
      if (!result.success) {
        pushToast({ title: "Category save failed", description: result.error, variant: "warning" });
        return;
      }
      pushToast({ title: createNew || !categoryId ? "Category created" : "Category updated", description: payload.name, variant: "success" });
      router.refresh();
    });
  };

  const saveBrand = (createNew = false) => {
    if (!validateBrand()) return;
    startTransition(async () => {
      const payload = {
        name: brandDraft.name.trim(),
        slug: slugify(brandDraft.slug || brandDraft.name),
        image: brandDraft.image.trim() || null,
      };
      const result = createNew || !brandId ? await createBrand(payload) : await updateBrand(brandId, payload);
      if (!result.success) {
        pushToast({ title: "Brand save failed", description: result.error, variant: "warning" });
        return;
      }
      pushToast({ title: createNew || !brandId ? "Brand created" : "Brand updated", description: payload.name, variant: "success" });
      router.refresh();
    });
  };

  const removeCategory = () => {
    if (!categoryId || !selectedCategory) return;
    if (!window.confirm(`Delete category "${selectedCategory.name}"?`)) return;
    startTransition(async () => {
      const result = await deleteCategory(categoryId);
      if (!result.success) {
        pushToast({ title: "Delete failed", description: result.error, variant: "warning" });
        return;
      }
      pushToast({ title: "Category deleted", description: selectedCategory.name, variant: "info" });
      router.refresh();
    });
  };

  const removeBrand = () => {
    if (!brandId || !selectedBrand) return;
    if (!window.confirm(`Delete brand "${selectedBrand.name}"?`)) return;
    startTransition(async () => {
      const result = await deleteBrand(brandId);
      if (!result.success) {
        pushToast({ title: "Delete failed", description: result.error, variant: "warning" });
        return;
      }
      pushToast({ title: "Brand deleted", description: selectedBrand.name, variant: "info" });
      router.refresh();
    });
  };

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <section className="rounded-[1.75rem] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 shadow-[0_18px_50px_rgba(8,18,38,0.08)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">Categories</h2>
          <button
            type="button"
            onClick={() => {
              setCategoryId(null);
              setCategoryDraft({ name: "", slug: "", image: "" });
              setCategoryErrors({});
            }}
            className="rounded-full border border-[var(--border-subtle)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-secondary transition-colors hover:text-[var(--foreground)]"
          >
            <Plus size={14} className="mr-1 inline-block" />
            New
          </button>
        </div>
        <div className="mb-4 max-h-56 space-y-2 overflow-y-auto pr-1">
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => {
                setCategoryId(category.id);
                setCategoryDraft({ name: category.name, slug: category.slug, image: category.image });
                setCategoryErrors({});
              }}
              className={`w-full rounded-xl border px-3 py-2 text-left text-sm ${
                category.id === categoryId
                  ? "border-primary/40 bg-primary/10 text-[var(--foreground)]"
                  : "border-[var(--border-subtle)] bg-[var(--surface-soft)] text-secondary"
              }`}
            >
              <p className="font-semibold">{category.name}</p>
              <p className="text-xs uppercase tracking-[0.16em]">{category.slug}</p>
            </button>
          ))}
        </div>
        <div className="space-y-3">
          <input
            value={categoryDraft.name}
            onChange={(event) => {
              setCategoryDraft((prev) => ({ ...prev, name: event.target.value, slug: prev.slug || slugify(event.target.value) }));
              setCategoryErrors((prev) => ({ ...prev, name: undefined }));
            }}
            placeholder="Category name"
            className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-soft)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
          />
          {categoryErrors.name ? <p className="text-xs font-medium text-[var(--status-error)]">{categoryErrors.name}</p> : null}
          <input
            value={categoryDraft.slug}
            onChange={(event) => {
              setCategoryDraft((prev) => ({ ...prev, slug: event.target.value }));
              setCategoryErrors((prev) => ({ ...prev, slug: undefined }));
            }}
            placeholder="category-slug"
            className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-soft)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
          />
          {categoryErrors.slug ? <p className="text-xs font-medium text-[var(--status-error)]">{categoryErrors.slug}</p> : null}
          <input
            value={categoryDraft.image}
            onChange={(event) => {
              setCategoryDraft((prev) => ({ ...prev, image: event.target.value }));
              setCategoryErrors((prev) => ({ ...prev, image: undefined }));
            }}
            placeholder="https://..."
            className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-soft)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
          />
          {categoryErrors.image ? <p className="text-xs font-medium text-[var(--status-error)]">{categoryErrors.image}</p> : null}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => saveCategory(false)}
            disabled={isPending}
            className="rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--primary-contrast)] disabled:opacity-60"
          >
            <Save size={14} className="mr-1 inline-block" />
            {isPending ? "Saving..." : categoryId ? "Save" : "Create"}
          </button>
          {!categoryId ? null : (
            <button
              type="button"
              onClick={removeCategory}
              disabled={isPending}
              className="rounded-full border border-[var(--status-error)]/25 bg-[var(--status-error)]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--status-error)] disabled:opacity-60"
            >
              <Trash2 size={14} className="mr-1 inline-block" />
              Delete
            </button>
          )}
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-5 shadow-[0_18px_50px_rgba(8,18,38,0.08)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">Brands</h2>
          <button
            type="button"
            onClick={() => {
              setBrandId(null);
              setBrandDraft({ name: "", slug: "", image: "" });
              setBrandErrors({});
            }}
            className="rounded-full border border-[var(--border-subtle)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-secondary transition-colors hover:text-[var(--foreground)]"
          >
            <Plus size={14} className="mr-1 inline-block" />
            New
          </button>
        </div>
        <div className="mb-4 max-h-56 space-y-2 overflow-y-auto pr-1">
          {brands.map((brand) => (
            <button
              key={brand.id}
              type="button"
              onClick={() => {
                setBrandId(brand.id);
                setBrandDraft({ name: brand.name, slug: brand.slug, image: brand.image ?? "" });
                setBrandErrors({});
              }}
              className={`w-full rounded-xl border px-3 py-2 text-left text-sm ${
                brand.id === brandId
                  ? "border-primary/40 bg-primary/10 text-[var(--foreground)]"
                  : "border-[var(--border-subtle)] bg-[var(--surface-soft)] text-secondary"
              }`}
            >
              <p className="font-semibold">{brand.name}</p>
              <p className="text-xs uppercase tracking-[0.16em]">{brand.slug}</p>
            </button>
          ))}
        </div>
        <div className="space-y-3">
          <input
            value={brandDraft.name}
            onChange={(event) => {
              setBrandDraft((prev) => ({ ...prev, name: event.target.value, slug: prev.slug || slugify(event.target.value) }));
              setBrandErrors((prev) => ({ ...prev, name: undefined }));
            }}
            placeholder="Brand name"
            className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-soft)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
          />
          {brandErrors.name ? <p className="text-xs font-medium text-[var(--status-error)]">{brandErrors.name}</p> : null}
          <input
            value={brandDraft.slug}
            onChange={(event) => {
              setBrandDraft((prev) => ({ ...prev, slug: event.target.value }));
              setBrandErrors((prev) => ({ ...prev, slug: undefined }));
            }}
            placeholder="brand-slug"
            className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-soft)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
          />
          {brandErrors.slug ? <p className="text-xs font-medium text-[var(--status-error)]">{brandErrors.slug}</p> : null}
          <input
            value={brandDraft.image}
            onChange={(event) => {
              setBrandDraft((prev) => ({ ...prev, image: event.target.value }));
              setBrandErrors((prev) => ({ ...prev, image: undefined }));
            }}
            placeholder="https://... (optional)"
            className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-soft)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
          />
          {brandErrors.image ? <p className="text-xs font-medium text-[var(--status-error)]">{brandErrors.image}</p> : null}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => saveBrand(false)}
            disabled={isPending}
            className="rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--primary-contrast)] disabled:opacity-60"
          >
            <Save size={14} className="mr-1 inline-block" />
            {isPending ? "Saving..." : brandId ? "Save" : "Create"}
          </button>
          {!brandId ? null : (
            <button
              type="button"
              onClick={removeBrand}
              disabled={isPending}
              className="rounded-full border border-[var(--status-error)]/25 bg-[var(--status-error)]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--status-error)] disabled:opacity-60"
            >
              <Trash2 size={14} className="mr-1 inline-block" />
              Delete
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
