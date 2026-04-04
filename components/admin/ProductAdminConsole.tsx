"use client";

import { type ChangeEvent, useDeferredValue, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Boxes, ImagePlus, Package2, PencilLine, Plus, Save, Search, Trash2 } from "lucide-react";
import type { Condition } from "@prisma/client";
import { bulkUpsertProducts, createProduct, deleteProduct, updateProduct } from "@/actions/admin-product";
import { useToast } from "@/components/ui/ToastProvider";
import { SafeImage } from "@/components/ui/SafeImage";

type AdminCategory = {
  id: string;
  name: string;
};

type AdminBrand = {
  id: string;
  name: string;
};

type AdminProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  condition: Condition;
  categoryId: string;
  categoryName: string;
  brandId?: string;
  brandName?: string;
  images: string[];
  technicalSpecs: Record<string, string | number | boolean | undefined>;
  updatedAt: string;
};

type SpecField = {
  key: string;
  value: string;
};

type ProductFormState = {
  name: string;
  slug: string;
  description: string;
  price: string;
  stock: string;
  condition: Condition;
  categoryId: string;
  brandId: string;
  imagesText: string;
  technicalSpecs: SpecField[];
};

type MediaAsset = {
  id?: string;
  filename: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  uploadedBy?: string | null;
  createdAt?: string;
};

type ProductFormErrors = Partial<
  Record<
    | "name"
    | "slug"
    | "description"
    | "price"
    | "stock"
    | "categoryId"
    | "brandId"
    | "imagesText"
    | "technicalSpecs",
    string
  >
>;

const CONDITION_OPTIONS: Condition[] = ["NEW", "OPEN_BOX", "REFURBISHED"];
const ADMIN_PRODUCTS_PAGE_SIZE = 12;

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 80);
}

function toFormState(product: AdminProduct | null, categories: AdminCategory[], brands: AdminBrand[]): ProductFormState {
  if (!product) {
    return {
      name: "",
      slug: "",
      description: "",
      price: "",
      stock: "0",
      condition: "NEW",
      categoryId: categories[0]?.id ?? "",
      brandId: brands[0]?.id ?? "",
      imagesText: "",
      technicalSpecs: [{ key: "battery", value: "" }, { key: "storage", value: "" }, { key: "ram", value: "" }],
    };
  }

  const specs = Object.entries(product.technicalSpecs ?? {}).map(([key, value]) => ({
    key,
    value: String(value ?? ""),
  }));

  return {
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: String(product.price),
    stock: String(product.stock),
    condition: product.condition,
    categoryId: product.categoryId,
    brandId: product.brandId ?? brands[0]?.id ?? "",
    imagesText: product.images.join("\n"),
    technicalSpecs: specs.length > 0 ? specs : [{ key: "battery", value: "" }],
  };
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value);
}

function formatCondition(value: Condition) {
  return value.replace(/_/g, " ");
}

function isValidUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function validateDraft(draft: ProductFormState): ProductFormErrors {
  const errors: ProductFormErrors = {};
  if (draft.name.trim().length < 2) errors.name = "Name must be at least 2 characters.";
  if (slugify(draft.slug || draft.name).length < 2) errors.slug = "Slug is required.";
  if (draft.description.trim().length < 8) errors.description = "Description must be at least 8 characters.";

  const price = Number(draft.price);
  if (!Number.isFinite(price) || price < 0) errors.price = "Price must be zero or more.";

  const stock = Number(draft.stock);
  if (!Number.isFinite(stock) || stock < 0) errors.stock = "Stock must be zero or more.";

  if (!draft.categoryId) errors.categoryId = "Choose a category.";
  if (!draft.brandId) errors.brandId = "Choose a brand.";

  const images = draft.imagesText
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
  if (images.length === 0) {
    errors.imagesText = "Add at least one image.";
  } else if (images.some((image) => !isValidUrl(image))) {
    errors.imagesText = "All images must be valid URLs.";
  }

  const validSpecs = draft.technicalSpecs.filter((item) => item.key.trim() && item.value.trim());
  if (validSpecs.length === 0) {
    errors.technicalSpecs = "Add at least one technical specification.";
  }

  return errors;
}

function parseCsvRow(row: string) {
  const columns: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < row.length; i += 1) {
    const char = row[i];
    if (char === '"') {
      if (inQuotes && row[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (char === "," && !inQuotes) {
      columns.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }

  columns.push(current.trim());
  return columns;
}

export function ProductAdminConsole({
  products,
  categories,
  brands,
}: {
  products: AdminProduct[];
  categories: AdminCategory[];
  brands: AdminBrand[];
}) {
  const router = useRouter();
  const { pushToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [selectedId, setSelectedId] = useState<string | null>(products[0]?.id ?? null);
  const [isCreating, setIsCreating] = useState(products.length === 0);
  const [draft, setDraft] = useState<ProductFormState>(() => toFormState(products[0] ?? null, categories, brands));
  const [slugTouched, setSlugTouched] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ProductFormErrors>({});
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [isMediaLoading, setIsMediaLoading] = useState(false);
  const [isMediaUploading, setIsMediaUploading] = useState(false);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();
    if (!normalizedQuery) return products;
    return products.filter((product) =>
      [product.name, product.slug, product.categoryName].some((value) => value.toLowerCase().includes(normalizedQuery)),
    );
  }, [deferredQuery, products]);
  const [currentPage, setCurrentPage] = useState(1);

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === selectedId) ?? null,
    [products, selectedId],
  );

  const totalStock = useMemo(() => products.reduce((sum, product) => sum + product.stock, 0), [products]);
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ADMIN_PRODUCTS_PAGE_SIZE));
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ADMIN_PRODUCTS_PAGE_SIZE;
    return filteredProducts.slice(start, start + ADMIN_PRODUCTS_PAGE_SIZE);
  }, [currentPage, filteredProducts]);

  useEffect(() => {
    setCurrentPage(1);
  }, [deferredQuery]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const loadMediaAssets = async () => {
    setIsMediaLoading(true);
    try {
      const response = await fetch("/api/admin/media/list", { cache: "no-store" });
      const data = await response.json();
      if (!data.success) {
        return;
      }
      setMediaAssets(data.assets || []);
    } finally {
      setIsMediaLoading(false);
    }
  };

  useEffect(() => {
    loadMediaAssets().catch(() => null);
  }, []);

  const handleFieldChange = (field: keyof ProductFormState, value: string) => {
    setDraft((current) => {
      const next = { ...current, [field]: value };
      if (field === "name" && !slugTouched) {
        next.slug = slugify(value);
      }
      return next;
    });
    setValidationErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSpecChange = (index: number, field: keyof SpecField, value: string) => {
    setDraft((current) => ({
      ...current,
      technicalSpecs: current.technicalSpecs.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    }));
    setValidationErrors((current) => ({ ...current, technicalSpecs: undefined }));
  };

  const addSpecRow = () => {
    setDraft((current) => ({
      ...current,
      technicalSpecs: [...current.technicalSpecs, { key: "", value: "" }],
    }));
    setValidationErrors((current) => ({ ...current, technicalSpecs: undefined }));
  };

  const removeSpecRow = (index: number) => {
    setDraft((current) => ({
      ...current,
      technicalSpecs: current.technicalSpecs.filter((_, itemIndex) => itemIndex !== index),
    }));
    setValidationErrors((current) => ({ ...current, technicalSpecs: undefined }));
  };

  const resetToCreate = () => {
    setIsCreating(true);
    setSelectedId(null);
    setDraft(toFormState(null, categories, brands));
    setSlugTouched(false);
    setValidationErrors({});
  };

  const selectProduct = (productId: string) => {
    const product = products.find((item) => item.id === productId) ?? null;
    setIsCreating(false);
    setSelectedId(productId);
    setDraft(toFormState(product, categories, brands));
    setSlugTouched(false);
    setValidationErrors({});
  };

  const buildPayload = () => ({
    name: draft.name.trim(),
    slug: slugify(draft.slug || draft.name),
    description: draft.description.trim(),
    price: Number(draft.price),
    stock: Number(draft.stock),
    condition: draft.condition,
    categoryId: draft.categoryId,
    brandId: draft.brandId || null,
    images: draft.imagesText
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean),
    technicalSpecs: Object.fromEntries(
      draft.technicalSpecs
        .map((item) => [item.key.trim(), item.value.trim()] as const)
        .filter(([key, value]) => key && value),
    ),
  });

  const insertImageUrl = (url: string) => {
    if (!url.trim()) return;
    setDraft((current) => {
      const existing = current.imagesText
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);
      if (existing.includes(url.trim())) return current;
      return {
        ...current,
        imagesText: [...existing, url.trim()].join("\n"),
      };
    });
    setValidationErrors((current) => ({ ...current, imagesText: undefined }));
  };

  const handleUploadImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsMediaUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!data.success) {
        pushToast({
          title: "Upload failed",
          description: data.error || "Unable to upload image.",
          variant: "warning",
        });
        return;
      }
      if (data.asset?.url) {
        insertImageUrl(data.asset.url);
      }
      pushToast({
        title: "Image uploaded",
        description: data.asset?.filename || file.name,
        variant: "success",
      });
      await loadMediaAssets();
    } catch {
      pushToast({
        title: "Upload failed",
        description: "Unable to upload image.",
        variant: "warning",
      });
    } finally {
      event.target.value = "";
      setIsMediaUploading(false);
    }
  };

  const handleDeleteMediaAsset = (asset: MediaAsset) => {
    if (!asset.id) return;
    if (!window.confirm(`Delete media asset "${asset.filename}"?`)) return;
    startTransition(async () => {
      const response = await fetch("/api/admin/media/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: asset.id }),
      });
      const data = await response.json();
      if (!data.success) {
        pushToast({
          title: "Delete failed",
          description: data.error || "Unable to delete media asset.",
          variant: "warning",
        });
        return;
      }
      pushToast({
        title: "Media deleted",
        description: asset.filename,
        variant: "info",
      });
      await loadMediaAssets();
    });
  };

  const handleExportCsv = () => {
    const headers = [
      "name",
      "slug",
      "description",
      "price",
      "stock",
      "condition",
      "category",
      "brand",
      "images",
      "technicalSpecs",
    ];
    const rows = products.map((product) => {
      const specs = JSON.stringify(product.technicalSpecs || {});
      const images = product.images.join("|");
      const fields = [
        product.name,
        product.slug,
        product.description,
        String(product.price),
        String(product.stock),
        product.condition,
        product.categoryName,
        product.brandName || "",
        images,
        specs,
      ];
      return fields
        .map((field) => `"${String(field).replace(/"/g, '""')}"`)
        .join(",");
    });
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `products_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleImportCsv = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const lines = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length < 2) {
      pushToast({
        title: "Import failed",
        description: "CSV file has no data rows.",
        variant: "warning",
      });
      event.target.value = "";
      return;
    }

    const headers = parseCsvRow(lines[0]).map((header) => header.toLowerCase());
    const idx = (name: string) => headers.indexOf(name);
    const required = ["name", "slug", "description", "price", "stock", "condition", "category"];
    if (required.some((field) => idx(field) === -1)) {
      pushToast({
        title: "Import failed",
        description: "CSV is missing required columns.",
        variant: "warning",
      });
      event.target.value = "";
      return;
    }

    const categoriesByName = new Map(categories.map((item) => [item.name.toLowerCase(), item.id]));
    const brandsByName = new Map(brands.map((item) => [item.name.toLowerCase(), item.id]));
    const payload = lines.slice(1).map((line) => {
      const cells = parseCsvRow(line);
      const categoryName = cells[idx("category")] || "";
      const brandName = idx("brand") >= 0 ? cells[idx("brand")] || "" : "";
      const imagesRaw = idx("images") >= 0 ? cells[idx("images")] || "" : "";
      const specsRaw = idx("technicalspecs") >= 0 ? cells[idx("technicalspecs")] || "" : "{}";

      return {
        name: cells[idx("name")] || "",
        slug: cells[idx("slug")] || "",
        description: cells[idx("description")] || "",
        price: Number(cells[idx("price")] || 0),
        stock: Number(cells[idx("stock")] || 0),
        condition: (cells[idx("condition")] || "NEW").toUpperCase() as Condition,
        categoryId: categoriesByName.get(categoryName.toLowerCase()) || categoryName,
        brandId: brandName ? brandsByName.get(brandName.toLowerCase()) || brandName : null,
        images: imagesRaw
          .split("|")
          .map((item) => item.trim())
          .filter(Boolean),
        technicalSpecs: (() => {
          try {
            const parsed = JSON.parse(specsRaw || "{}") as Record<string, string>;
            return parsed && typeof parsed === "object" ? parsed : {};
          } catch {
            return {};
          }
        })(),
      };
    });

    startTransition(async () => {
      const result = await bulkUpsertProducts(payload);
      if (!result.success) {
        pushToast({
          title: "Import failed",
          description: result.error,
          variant: "warning",
        });
        return;
      }
      pushToast({
        title: "Import complete",
        description: `Created: ${"created" in result ? result.created : 0}, Updated: ${"updated" in result ? result.updated : 0}`,
        variant: "success",
      });
      router.refresh();
    });

    event.target.value = "";
  };

  const handleSubmit = () => {
    const errors = validateDraft(draft);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      pushToast({
        title: "Fix form errors",
        description: "Some fields are invalid. Check highlighted sections.",
        variant: "warning",
      });
      return;
    }

    const payload = buildPayload();

    startTransition(async () => {
      const result = isCreating || !selectedId ? await createProduct(payload) : await updateProduct(selectedId, payload);

      if (!result.success) {
        pushToast({
          title: "Product save failed",
          description: result.error,
          variant: "warning",
        });
        return;
      }

      pushToast({
        title: isCreating ? "Product created" : "Product updated",
        description: payload.name,
        variant: "success",
      });

      setIsCreating(false);
      if (result.productId) {
        setSelectedId(result.productId);
      }
      setSlugTouched(false);
      setValidationErrors({});
      router.refresh();
    });
  };

  const handleDelete = () => {
    if (!selectedId || !selectedProduct) return;
    if (!window.confirm(`Delete ${selectedProduct.name}? This cannot be undone.`)) return;

    startTransition(async () => {
      const result = await deleteProduct(selectedId);
      if (!result.success) {
        pushToast({
          title: "Delete failed",
          description: result.error,
          variant: "warning",
        });
        return;
      }

      pushToast({
        title: "Product deleted",
        description: selectedProduct.name,
        variant: "info",
      });

        const nextProduct = products.find((product) => product.id !== selectedId) ?? null;
        setSelectedId(nextProduct?.id ?? null);
        setIsCreating(!nextProduct);
        setDraft(toFormState(nextProduct, categories, brands));
        setSlugTouched(false);
        setValidationErrors({});
      router.refresh();
    });
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
      <div className="space-y-6">
        <section className="rounded-[2rem] border border-[var(--border-subtle)] bg-[linear-gradient(180deg,var(--surface-card-strong),var(--surface-card))] p-5 shadow-[0_22px_64px_rgba(var(--shadow-neutral-rgb),0.12)]">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-soft)]">Inventory</p>
              <h2 className="mt-2 text-2xl font-bold text-[var(--foreground)]">Products</h2>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <label className="interactive-focus inline-flex cursor-pointer items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-soft)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-secondary transition-colors hover:text-[var(--foreground)]">
                Import CSV
                <input type="file" accept=".csv,text/csv" onChange={handleImportCsv} className="sr-only" />
              </label>
              <button
                type="button"
                onClick={handleExportCsv}
                className="interactive-focus inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-soft)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-secondary transition-colors hover:text-[var(--foreground)]"
              >
                Export CSV
              </button>
              <button
                type="button"
                onClick={resetToCreate}
                className="interactive-focus inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-[var(--primary-contrast)] shadow-[0_18px_40px_rgba(var(--shadow-brand-rgb),0.25)] transition-colors hover:bg-[var(--primary-hover)]"
              >
                <Plus size={16} />
                New
              </button>
            </div>
          </div>

          <div className="mb-4 grid grid-cols-3 gap-3">
            <div className="rounded-[1.35rem] border border-[var(--border-subtle)] bg-[var(--surface-soft)] p-3">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-soft)]">Count</p>
              <p className="mt-2 text-xl font-semibold text-[var(--foreground)]">{products.length}</p>
            </div>
            <div className="rounded-[1.35rem] border border-[var(--border-subtle)] bg-[var(--surface-soft)] p-3">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-soft)]">Stock</p>
              <p className="mt-2 text-xl font-semibold text-[var(--foreground)]">{totalStock}</p>
            </div>
            <div className="rounded-[1.35rem] border border-[var(--border-subtle)] bg-[var(--surface-soft)] p-3">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-soft)]">Categories</p>
              <p className="mt-2 text-xl font-semibold text-[var(--foreground)]">{categories.length}</p>
            </div>
          </div>

          <label className="relative block">
            <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-secondary" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name, slug, or category"
              className="interactive-focus w-full rounded-[1.25rem] border border-[var(--border-subtle)] bg-[var(--surface-soft)] py-3 pl-11 pr-4 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--text-soft)] focus:border-[var(--interactive-border-strong)] focus-visible:ring-2 focus-visible:ring-primary/25"
            />
          </label>
        </section>

        <section className="space-y-3">
          {filteredProducts.length === 0 ? (
            <div className="rounded-[1.75rem] border border-[var(--border-subtle)] bg-[linear-gradient(180deg,var(--surface-card),var(--surface-soft))] p-6 text-sm text-secondary">
              No products match the current search.
            </div>
          ) : (
            paginatedProducts.map((product) => {
              const active = !isCreating && product.id === selectedId;
              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => selectProduct(product.id)}
                  className={`interactive-focus w-full rounded-[1.75rem] border p-4 text-left transition-all duration-[var(--motion-base)] ease-[var(--ease-standard)] ${
                    active
                      ? "border-primary/40 bg-[linear-gradient(180deg,var(--surface-card-strong),var(--surface-card))] shadow-[0_20px_50px_rgba(var(--shadow-neutral-rgb),0.12)]"
                      : "border-[var(--border-subtle)] bg-[linear-gradient(180deg,var(--surface-card),var(--surface-soft))] hover:border-[var(--interactive-border-strong)] hover:-translate-y-0.5"
                  }`}
                >
                  <div className="mb-3 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[var(--foreground)]">{product.name}</p>
                      <p className="mt-1 truncate text-xs uppercase tracking-[0.16em] text-[var(--text-soft)]">{product.slug}</p>
                    </div>
                    <span className="rounded-full border border-[var(--border-subtle)] bg-[var(--surface-soft)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
                      {formatCondition(product.condition)}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="rounded-[1rem] bg-[var(--surface-soft)] px-3 py-2">
                      <p className="text-[var(--text-soft)]">Price</p>
                      <p className="mt-1 font-semibold text-[var(--foreground)]">{formatCurrency(product.price)}</p>
                    </div>
                    <div className="rounded-[1rem] bg-[var(--surface-soft)] px-3 py-2">
                      <p className="text-[var(--text-soft)]">Stock</p>
                      <p className="mt-1 font-semibold text-[var(--foreground)]">{product.stock}</p>
                    </div>
                    <div className="rounded-[1rem] bg-[var(--surface-soft)] px-3 py-2">
                      <p className="text-[var(--text-soft)]">Category</p>
                      <p className="mt-1 truncate font-semibold text-[var(--foreground)]">{product.categoryName}</p>
                    </div>
                  </div>
                </button>
              );
            })
          )}
          {filteredProducts.length > ADMIN_PRODUCTS_PAGE_SIZE ? (
            <div className="mt-3 flex items-center justify-between rounded-[1.25rem] border border-[var(--border-subtle)] bg-[var(--surface-soft)] px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-soft)]">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  className="rounded-full border border-[var(--border-subtle)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-secondary disabled:opacity-50"
                >
                  Prev
                </button>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  className="rounded-full border border-[var(--border-subtle)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-secondary disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}
        </section>
      </div>

      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-[2rem] border border-[var(--border-subtle)] bg-[linear-gradient(180deg,var(--surface-card-strong),var(--surface-card))] p-6 shadow-[0_24px_70px_rgba(var(--shadow-neutral-rgb),0.14)]"
      >
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-soft)]">
              {isCreating ? "Create product" : "Edit product"}
            </p>
            <h2 className="mt-2 text-3xl font-bold text-[var(--foreground)]">
              {isCreating ? "New inventory entry" : draft.name || "Product editor"}
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-secondary">
              Update catalog data, media, specs, pricing, and inventory without leaving the app’s visual system.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {!isCreating && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="interactive-focus inline-flex items-center gap-2 rounded-full border border-[var(--status-error)]/25 bg-[var(--status-error)]/10 px-4 py-2 text-sm font-semibold text-[var(--status-error)] transition-colors hover:bg-[var(--status-error)]/15 disabled:opacity-50"
              >
                <Trash2 size={16} />
                Delete
              </button>
            )}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending}
              className="interactive-focus inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-[var(--primary-contrast)] shadow-[0_18px_40px_rgba(var(--shadow-brand-rgb),0.25)] transition-colors hover:bg-[var(--primary-hover)] disabled:opacity-60"
            >
              <Save size={16} />
              {isPending ? "Saving..." : isCreating ? "Create product" : "Save changes"}
            </button>
          </div>
        </div>

        <div className="mb-8 grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
          <div className="rounded-[1.75rem] border border-[var(--border-subtle)] bg-[var(--surface-soft)] p-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-soft)]">Name</span>
                <input
                  value={draft.name}
                  onChange={(event) => handleFieldChange("name", event.target.value)}
                  className="interactive-focus w-full rounded-[1rem] border border-[var(--border-subtle)] bg-[var(--surface-card)] px-4 py-3 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--text-soft)] focus-visible:ring-2 focus-visible:ring-primary/25"
                  placeholder="iPhone 16 Pro Max"
                />
                {validationErrors.name ? <p className="mt-2 text-xs font-medium text-[var(--status-error)]">{validationErrors.name}</p> : null}
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-soft)]">Slug</span>
                <input
                  value={draft.slug}
                  onChange={(event) => {
                    setSlugTouched(true);
                    handleFieldChange("slug", event.target.value);
                  }}
                  className="interactive-focus w-full rounded-[1rem] border border-[var(--border-subtle)] bg-[var(--surface-card)] px-4 py-3 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--text-soft)] focus-visible:ring-2 focus-visible:ring-primary/25"
                  placeholder="iphone_16_pro_max"
                />
                {validationErrors.slug ? <p className="mt-2 text-xs font-medium text-[var(--status-error)]">{validationErrors.slug}</p> : null}
              </label>
            </div>

            <label className="mt-4 block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-soft)]">Description</span>
              <textarea
                value={draft.description}
                onChange={(event) => handleFieldChange("description", event.target.value)}
                rows={5}
                className="interactive-focus w-full rounded-[1rem] border border-[var(--border-subtle)] bg-[var(--surface-card)] px-4 py-3 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--text-soft)] focus-visible:ring-2 focus-visible:ring-primary/25"
                placeholder="Premium device with..."
              />
              {validationErrors.description ? (
                <p className="mt-2 text-xs font-medium text-[var(--status-error)]">{validationErrors.description}</p>
              ) : null}
            </label>

            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-soft)]">Price</span>
                <input
                  type="number"
                  min="0"
                  value={draft.price}
                  onChange={(event) => handleFieldChange("price", event.target.value)}
                  className="interactive-focus w-full rounded-[1rem] border border-[var(--border-subtle)] bg-[var(--surface-card)] px-4 py-3 text-sm text-[var(--foreground)] outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
                />
                {validationErrors.price ? <p className="mt-2 text-xs font-medium text-[var(--status-error)]">{validationErrors.price}</p> : null}
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-soft)]">Stock</span>
                <input
                  type="number"
                  min="0"
                  value={draft.stock}
                  onChange={(event) => handleFieldChange("stock", event.target.value)}
                  className="interactive-focus w-full rounded-[1rem] border border-[var(--border-subtle)] bg-[var(--surface-card)] px-4 py-3 text-sm text-[var(--foreground)] outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
                />
                {validationErrors.stock ? <p className="mt-2 text-xs font-medium text-[var(--status-error)]">{validationErrors.stock}</p> : null}
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-soft)]">Condition</span>
                <select
                  value={draft.condition}
                  onChange={(event) => setDraft((current) => ({ ...current, condition: event.target.value as Condition }))}
                  className="interactive-focus w-full rounded-[1rem] border border-[var(--border-subtle)] bg-[var(--surface-card)] px-4 py-3 text-sm text-[var(--foreground)] outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
                >
                  {CONDITION_OPTIONS.map((option) => (
                    <option key={option} value={option} className="bg-[var(--panel-bg)] text-[var(--foreground)]">
                      {formatCondition(option)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-soft)]">Category</span>
                <select
                  value={draft.categoryId}
                  onChange={(event) => {
                    setDraft((current) => ({ ...current, categoryId: event.target.value }));
                    setValidationErrors((current) => ({ ...current, categoryId: undefined }));
                  }}
                  className="interactive-focus w-full rounded-[1rem] border border-[var(--border-subtle)] bg-[var(--surface-card)] px-4 py-3 text-sm text-[var(--foreground)] outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id} className="bg-[var(--panel-bg)] text-[var(--foreground)]">
                      {category.name}
                    </option>
                  ))}
                </select>
                {validationErrors.categoryId ? (
                  <p className="mt-2 text-xs font-medium text-[var(--status-error)]">{validationErrors.categoryId}</p>
                ) : null}
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-soft)]">Brand</span>
                <select
                  value={draft.brandId}
                  onChange={(event) => {
                    setDraft((current) => ({ ...current, brandId: event.target.value }));
                    setValidationErrors((current) => ({ ...current, brandId: undefined }));
                  }}
                  className="interactive-focus w-full rounded-[1rem] border border-[var(--border-subtle)] bg-[var(--surface-card)] px-4 py-3 text-sm text-[var(--foreground)] outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
                >
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id} className="bg-[var(--panel-bg)] text-[var(--foreground)]">
                      {brand.name}
                    </option>
                  ))}
                </select>
                {validationErrors.brandId ? (
                  <p className="mt-2 text-xs font-medium text-[var(--status-error)]">{validationErrors.brandId}</p>
                ) : null}
              </label>
            </div>
          </div>

          <div className="overflow-hidden rounded-[1.75rem] border border-[var(--border-subtle)] bg-[linear-gradient(180deg,var(--surface-soft),var(--surface-card))]">
            <div
              className="relative h-full min-h-56 bg-cover bg-center"
              style={{ backgroundImage: draft.imagesText.split("\n").find(Boolean) ? `url(${draft.imagesText.split("\n").find(Boolean)})` : undefined }}
            >
              <div className="absolute inset-0 bg-[image:var(--media-overlay-strong-gradient)]" />
              <div className="relative z-10 flex h-full flex-col justify-between p-4">
                <div className="inline-flex max-w-max items-center gap-2 rounded-full border border-[var(--media-overlay-border)] bg-[var(--media-overlay-bg)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--media-overlay-text)] backdrop-blur-md">
                  <Boxes size={12} />
                  Live preview
                </div>
                <div>
                  <p className="text-lg font-semibold text-[var(--media-overlay-text)]">{draft.name || "Product title"}</p>
                  <p className="mt-1 text-sm text-[var(--media-overlay-soft-text)]">
                    {draft.price ? formatCurrency(Number(draft.price) || 0) : "Add price"} • {formatCondition(draft.condition)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="rounded-[1.75rem] border border-[var(--border-subtle)] bg-[var(--surface-soft)] p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-full bg-primary/12 p-2 text-primary">
                <ImagePlus size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--foreground)]">Image URLs</p>
                <p className="text-xs text-secondary">One image URL per line. The first image becomes the main preview.</p>
              </div>
            </div>
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <label className="rounded-full border border-[var(--border-subtle)] bg-[var(--surface-card)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-secondary transition-colors hover:text-[var(--foreground)]">
                {isMediaUploading ? "Uploading..." : "Upload image"}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={handleUploadImage}
                  className="sr-only"
                  disabled={isMediaUploading}
                />
              </label>
              <button
                type="button"
                onClick={() => loadMediaAssets().catch(() => null)}
                className="rounded-full border border-[var(--border-subtle)] bg-[var(--surface-card)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-secondary transition-colors hover:text-[var(--foreground)]"
              >
                {isMediaLoading ? "Refreshing..." : "Refresh library"}
              </button>
            </div>
            <textarea
              value={draft.imagesText}
              onChange={(event) => handleFieldChange("imagesText", event.target.value)}
              rows={8}
              className="interactive-focus w-full rounded-[1rem] border border-[var(--border-subtle)] bg-[var(--surface-card)] px-4 py-3 font-mono text-xs text-[var(--foreground)] outline-none placeholder:text-[var(--text-soft)] focus-visible:ring-2 focus-visible:ring-primary/25"
              placeholder={"https://...\nhttps://..."}
            />
            {validationErrors.imagesText ? (
              <p className="mt-2 text-xs font-medium text-[var(--status-error)]">{validationErrors.imagesText}</p>
            ) : null}
            {mediaAssets.length > 0 ? (
              <div className="mt-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-soft)]">Media library</p>
                <div className="grid max-h-56 grid-cols-3 gap-2 overflow-y-auto pr-1 sm:grid-cols-4">
                  {mediaAssets.map((asset) => (
                    <div key={asset.id || asset.url} className="group relative h-20 overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-card)]">
                      <SafeImage src={asset.url} alt={asset.filename} fill className="object-cover" sizes="120px" />
                      <div className="absolute inset-0 flex items-end justify-between gap-1 bg-[image:var(--media-overlay-strong-gradient)] p-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => insertImageUrl(asset.url)}
                          className="rounded-full bg-[var(--media-overlay-action-bg)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--media-overlay-text)]"
                        >
                          Use
                        </button>
                        {asset.id ? (
                          <button
                            type="button"
                            onClick={() => handleDeleteMediaAsset(asset)}
                            className="rounded-full bg-[var(--status-error)]/70 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--media-overlay-text)]"
                          >
                            Del
                          </button>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="rounded-[1.75rem] border border-[var(--border-subtle)] bg-[var(--surface-soft)] p-5">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/12 p-2 text-primary">
                  <PencilLine size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--foreground)]">Technical specs</p>
                  <p className="text-xs text-secondary">Structured keys keep cards and detail pages readable.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={addSpecRow}
                className="interactive-focus rounded-full border border-[var(--border-subtle)] bg-[var(--surface-card)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-secondary transition-colors hover:text-[var(--foreground)]"
              >
                Add spec
              </button>
            </div>

            <div className="space-y-3">
              {draft.technicalSpecs.map((item, index) => (
                <div key={`${index}-${item.key}`} className="grid gap-3 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)_auto]">
                  <input
                    value={item.key}
                    onChange={(event) => handleSpecChange(index, "key", event.target.value)}
                    className="interactive-focus rounded-[1rem] border border-[var(--border-subtle)] bg-[var(--surface-card)] px-4 py-3 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--text-soft)] focus-visible:ring-2 focus-visible:ring-primary/25"
                    placeholder="battery"
                  />
                  <input
                    value={item.value}
                    onChange={(event) => handleSpecChange(index, "value", event.target.value)}
                    className="interactive-focus rounded-[1rem] border border-[var(--border-subtle)] bg-[var(--surface-card)] px-4 py-3 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--text-soft)] focus-visible:ring-2 focus-visible:ring-primary/25"
                    placeholder="4700mAh"
                  />
                  <button
                    type="button"
                    onClick={() => removeSpecRow(index)}
                    className="interactive-focus rounded-[1rem] border border-[var(--border-subtle)] bg-[var(--surface-card)] px-3 py-3 text-secondary transition-colors hover:text-[var(--status-error)]"
                    aria-label={`Remove technical spec ${index + 1}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            {validationErrors.technicalSpecs ? (
              <p className="mt-3 text-xs font-medium text-[var(--status-error)]">{validationErrors.technicalSpecs}</p>
            ) : null}
          </div>
        </div>

        <div className="mt-6 rounded-[1.5rem] border border-[var(--border-subtle)] bg-[var(--surface-soft)] p-4">
          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.18em] text-[var(--text-soft)]">
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-card)] px-3 py-1.5">
              <Package2 size={14} />
              {isCreating ? "Create mode" : "Editing live product"}
            </span>
            {!isCreating && selectedProduct && (
              <span className="rounded-full border border-[var(--border-subtle)] bg-[var(--surface-card)] px-3 py-1.5">
                Updated {new Date(selectedProduct.updatedAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
              </span>
            )}
          </div>
        </div>
      </motion.section>
    </div>
  );
}


