"use client";

import { type ChangeEvent, useDeferredValue, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Boxes, ImagePlus, Package2, PencilLine, Plus, Save, Search, Trash2 } from "lucide-react";
import type { Condition } from "@prisma/client";
import { createBrand } from "@/actions/admin-taxonomy";
import {
  bulkDeleteProducts,
  bulkUpdateProducts,
  createProduct,
  deleteProduct,
  updateProduct,
} from "@/actions/admin-product";
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

type BulkEditState = {
  categoryId: string;
  brandId: string;
  condition: string;
  price: string;
  stock: string;
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
const BULK_NO_CHANGE = "__NO_CHANGE__";
const BULK_CLEAR_BRAND = "__CLEAR_BRAND__";

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
  const [availableBrands, setAvailableBrands] = useState<AdminBrand[]>(brands);
  const [selectedId, setSelectedId] = useState<string | null>(products[0]?.id ?? null);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(products.length === 0);
  const [draft, setDraft] = useState<ProductFormState>(() => toFormState(products[0] ?? null, categories, brands));
  const [bulkEdit, setBulkEdit] = useState<BulkEditState>({
    categoryId: BULK_NO_CHANGE,
    brandId: BULK_NO_CHANGE,
    condition: BULK_NO_CHANGE,
    price: "",
    stock: "",
  });
  const [newBrandName, setNewBrandName] = useState("");
  const [newBrandImage, setNewBrandImage] = useState("");
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
  const pageProductIds = useMemo(() => paginatedProducts.map((product) => product.id), [paginatedProducts]);
  const selectedCount = selectedProductIds.length;
  const allPageSelected =
    pageProductIds.length > 0 && pageProductIds.every((productId) => selectedProductIds.includes(productId));

  useEffect(() => {
    setAvailableBrands(brands);
  }, [brands]);

  useEffect(() => {
    setCurrentPage(1);
  }, [deferredQuery]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    if (isCreating) return;
    if (!products.length) {
      setIsCreating(true);
      setSelectedId(null);
      setDraft(toFormState(null, categories, availableBrands));
      setSlugTouched(false);
      setValidationErrors({});
      return;
    }
    const exists = selectedId ? products.some((product) => product.id === selectedId) : false;
    if (!exists) {
      const first = products[0];
      setIsCreating(false);
      setSelectedId(first.id);
      setDraft(toFormState(first, categories, availableBrands));
      setSlugTouched(false);
      setValidationErrors({});
    }
  }, [isCreating, products, selectedId, categories, availableBrands]);

  useEffect(() => {
    setSelectedProductIds((current) => current.filter((productId) => products.some((product) => product.id === productId)));
  }, [products]);

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
    setDraft(toFormState(null, categories, availableBrands));
    setSlugTouched(false);
    setValidationErrors({});
  };

  const selectProduct = (productId: string) => {
    const product = products.find((item) => item.id === productId) ?? null;
    setIsCreating(false);
    setSelectedId(productId);
    setDraft(toFormState(product, categories, availableBrands));
    setSlugTouched(false);
    setValidationErrors({});
  };

  const toggleProductSelection = (productId: string, checked: boolean) => {
    setSelectedProductIds((current) => {
      const next = new Set(current);
      if (checked) {
        next.add(productId);
      } else {
        next.delete(productId);
      }
      return Array.from(next);
    });
  };

  const togglePageSelection = () => {
    setSelectedProductIds((current) => {
      const next = new Set(current);
      if (allPageSelected) {
        for (const productId of pageProductIds) {
          next.delete(productId);
        }
      } else {
        for (const productId of pageProductIds) {
          next.add(productId);
        }
      }
      return Array.from(next);
    });
  };

  const clearSelection = () => {
    setSelectedProductIds([]);
  };

  const handleCreateBrand = () => {
    const name = newBrandName.trim();
    if (name.length < 2) {
      pushToast({
        title: "Brand name required",
        description: "Enter at least 2 characters to create a brand.",
        variant: "warning",
      });
      return;
    }

    const image = newBrandImage.trim();
    if (image && !isValidUrl(image)) {
      pushToast({
        title: "Invalid image URL",
        description: "Brand image must be a valid URL.",
        variant: "warning",
      });
      return;
    }

    startTransition(async () => {
      try {
        const payload = {
          name,
          slug: slugify(name),
          image: image || null,
        };
        const result = await createBrand(payload);
        if (!result.success || !result.brandId) {
          pushToast({
            title: "Brand creation failed",
            description: result.error || "Unable to create brand right now.",
            variant: "warning",
          });
          return;
        }

        const createdBrand = { id: result.brandId, name };
        setAvailableBrands((current) => {
          if (current.some((brand) => brand.id === createdBrand.id)) return current;
          return [...current, createdBrand].sort((a, b) => a.name.localeCompare(b.name));
        });
        setDraft((current) => ({ ...current, brandId: createdBrand.id }));
        setNewBrandName("");
        setNewBrandImage("");
        pushToast({
          title: "Brand created",
          description: name,
          variant: "success",
        });
        router.refresh();
      } catch {
        pushToast({
          title: "Brand creation failed",
          description: "Unable to create brand right now.",
          variant: "warning",
        });
      }
    });
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
      try {
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
      } catch {
        pushToast({
          title: "Delete failed",
          description: "Unable to delete media asset right now.",
          variant: "warning",
        });
      }
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

    const categoriesByKey = new Map<string, string>();
    for (const category of categories) {
      categoriesByKey.set(category.id.toLowerCase(), category.id);
      categoriesByKey.set(category.name.toLowerCase(), category.id);
    }
    const unknownCategories = new Set<string>();

    const rows = lines.slice(1).map((line) => {
      const cells = parseCsvRow(line);
      const categoryValue = (cells[idx("category")] || "").trim();
      const brandValue = idx("brand") >= 0 ? (cells[idx("brand")] || "").trim() : "";
      const imagesRaw = idx("images") >= 0 ? cells[idx("images")] || "" : "";
      const specsRaw = idx("technicalspecs") >= 0 ? cells[idx("technicalspecs")] || "" : "{}";
      const resolvedCategoryId = categoriesByKey.get(categoryValue.toLowerCase());

      if (!resolvedCategoryId && categoryValue) {
        unknownCategories.add(categoryValue);
      }

      return {
        name: cells[idx("name")] || "",
        slug: cells[idx("slug")] || "",
        description: cells[idx("description")] || "",
        price: Number(cells[idx("price")] || 0),
        stock: Number(cells[idx("stock")] || 0),
        condition: (cells[idx("condition")] || "NEW").toUpperCase() as Condition,
        categoryId: resolvedCategoryId || categoryValue,
        brandValue,
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

    if (unknownCategories.size > 0) {
      const unknownCategoriesList = Array.from(unknownCategories).slice(0, 4);
      const fragments: string[] = [];
      if (unknownCategoriesList.length > 0) {
        fragments.push(`Unknown categories: ${unknownCategoriesList.join(", ")}`);
      }
      pushToast({
        title: "Import failed",
        description: fragments.join(" | "),
        variant: "warning",
      });
      event.target.value = "";
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/admin/products/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rows }),
        });
        const result = (await response.json()) as {
          success: boolean;
          error?: string;
          created?: number;
          updated?: number;
          createdBrands?: Array<{ id: string; name: string }>;
        };

        if (!response.ok || !result.success) {
          pushToast({
            title: "Import failed",
            description: result.error || "Unable to import CSV right now.",
            variant: "warning",
          });
          return;
        }

        if (Array.isArray(result.createdBrands) && result.createdBrands.length > 0) {
          setAvailableBrands((current) => {
            const existingById = new Set(current.map((brand) => brand.id));
            const merged = [...current];
            for (const brand of result.createdBrands || []) {
              if (!existingById.has(brand.id)) {
                merged.push({ id: brand.id, name: brand.name });
                existingById.add(brand.id);
              }
            }
            return merged.sort((a, b) => a.name.localeCompare(b.name));
          });
          pushToast({
            title: "Missing brands created",
            description: result.createdBrands.slice(0, 4).map((brand) => brand.name).join(", "),
            variant: "info",
          });
        }

        pushToast({
          title: "Import complete",
          description: `Created: ${result.created ?? 0}, Updated: ${result.updated ?? 0}`,
          variant: "success",
        });
        router.refresh();
      } catch {
        pushToast({
          title: "Import failed",
          description: "Unable to import CSV right now.",
          variant: "warning",
        });
      }
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
      try {
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
      } catch {
        pushToast({
          title: "Product save failed",
          description: "Unable to save product right now.",
          variant: "warning",
        });
      }
    });
  };

  const handleDelete = () => {
    if (!selectedId || !selectedProduct) return;
    if (!window.confirm(`Delete ${selectedProduct.name}? This cannot be undone.`)) return;

    startTransition(async () => {
      try {
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
        setDraft(toFormState(nextProduct, categories, availableBrands));
        setSlugTouched(false);
        setValidationErrors({});
        router.refresh();
      } catch {
        pushToast({
          title: "Delete failed",
          description: "Unable to delete product right now.",
          variant: "warning",
        });
      }
    });
  };

  const handleBulkUpdate = () => {
    if (selectedProductIds.length === 0) {
      pushToast({
        title: "Nothing selected",
        description: "Select one or more products first.",
        variant: "warning",
      });
      return;
    }

    const payload: {
      categoryId?: string;
      brandId?: string | null;
      condition?: Condition;
      price?: number;
      stock?: number;
    } = {};

    if (bulkEdit.categoryId !== BULK_NO_CHANGE) {
      payload.categoryId = bulkEdit.categoryId;
    }
    if (bulkEdit.brandId === BULK_CLEAR_BRAND) {
      payload.brandId = null;
    } else if (bulkEdit.brandId !== BULK_NO_CHANGE) {
      payload.brandId = bulkEdit.brandId;
    }
    if (bulkEdit.condition !== BULK_NO_CHANGE) {
      payload.condition = bulkEdit.condition as Condition;
    }

    if (bulkEdit.price.trim()) {
      const price = Number(bulkEdit.price);
      if (!Number.isFinite(price) || price < 0 || !Number.isInteger(price)) {
        pushToast({
          title: "Invalid price",
          description: "Bulk price must be a whole number that is zero or more.",
          variant: "warning",
        });
        return;
      }
      payload.price = price;
    }

    if (bulkEdit.stock.trim()) {
      const stock = Number(bulkEdit.stock);
      if (!Number.isFinite(stock) || stock < 0 || !Number.isInteger(stock)) {
        pushToast({
          title: "Invalid stock",
          description: "Bulk stock must be a whole number that is zero or more.",
          variant: "warning",
        });
        return;
      }
      payload.stock = stock;
    }

    if (Object.keys(payload).length === 0) {
      pushToast({
        title: "No bulk changes selected",
        description: "Choose at least one field to update.",
        variant: "warning",
      });
      return;
    }

    startTransition(async () => {
      try {
        const result = await bulkUpdateProducts(selectedProductIds, payload);
        if (!result.success) {
          pushToast({
            title: "Bulk update failed",
            description: result.error || "Unable to update selected products.",
            variant: "warning",
          });
          return;
        }

        pushToast({
          title: "Bulk update complete",
          description: `${result.updated} product${result.updated === 1 ? "" : "s"} updated.`,
          variant: "success",
        });
        setSelectedProductIds([]);
        router.refresh();
      } catch {
        pushToast({
          title: "Bulk update failed",
          description: "Unable to update selected products right now.",
          variant: "warning",
        });
      }
    });
  };

  const handleBulkDelete = () => {
    if (selectedProductIds.length === 0) {
      pushToast({
        title: "Nothing selected",
        description: "Select one or more products first.",
        variant: "warning",
      });
      return;
    }
    if (
      !window.confirm(
        `Delete ${selectedProductIds.length} selected product${selectedProductIds.length === 1 ? "" : "s"}? This cannot be undone.`,
      )
    ) {
      return;
    }

    startTransition(async () => {
      try {
        const result = await bulkDeleteProducts(selectedProductIds);
        if (!result.success && result.deleted === 0) {
          pushToast({
            title: "Bulk delete failed",
            description: result.error || "Unable to delete selected products.",
            variant: "warning",
          });
          return;
        }

        if (result.deleted > 0) {
          pushToast({
            title: "Bulk delete complete",
            description: `${result.deleted} product${result.deleted === 1 ? "" : "s"} deleted.`,
            variant: "info",
          });
        }
        if (result.blocked.length > 0) {
          pushToast({
            title: "Some products were skipped",
            description: result.error || `${result.blocked.length} product(s) are linked to orders and cannot be deleted.`,
            variant: "warning",
          });
        }

        setSelectedProductIds([]);
        router.refresh();
      } catch {
        pushToast({
          title: "Bulk delete failed",
          description: "Unable to delete selected products right now.",
          variant: "warning",
        });
      }
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
          {filteredProducts.length > 0 ? (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-[1.25rem] border border-[var(--border-subtle)] bg-[var(--surface-soft)] px-3 py-2">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={togglePageSelection}
                  className="rounded-full border border-[var(--border-subtle)] bg-[var(--surface-card)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-secondary transition-colors hover:text-[var(--foreground)]"
                >
                  {allPageSelected ? "Unselect page" : "Select page"}
                </button>
                <button
                  type="button"
                  onClick={clearSelection}
                  disabled={selectedCount === 0}
                  className="rounded-full border border-[var(--border-subtle)] bg-[var(--surface-card)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-secondary transition-colors hover:text-[var(--foreground)] disabled:opacity-50"
                >
                  Clear selected
                </button>
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-soft)]">{selectedCount} selected</p>
            </div>
          ) : null}

          {filteredProducts.length === 0 ? (
            <div className="rounded-[1.75rem] border border-[var(--border-subtle)] bg-[linear-gradient(180deg,var(--surface-card),var(--surface-soft))] p-6 text-sm text-secondary">
              No products match the current search.
            </div>
          ) : (
            paginatedProducts.map((product) => {
              const active = !isCreating && product.id === selectedId;
              const checked = selectedProductIds.includes(product.id);
              return (
                <div key={product.id} className="flex items-start gap-3">
                  <label className="mt-4 inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(event) => toggleProductSelection(product.id, event.target.checked)}
                      className="h-4 w-4 rounded border-[var(--border-subtle)] accent-primary"
                      aria-label={`Select ${product.name}`}
                    />
                  </label>
                  <button
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
                </div>
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

          {selectedCount > 0 ? (
            <section className="rounded-[1.5rem] border border-[var(--border-subtle)] bg-[linear-gradient(180deg,var(--surface-card),var(--surface-soft))] p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-soft)]">
                  Bulk actions for {selectedCount} product{selectedCount === 1 ? "" : "s"}
                </p>
                <button
                  type="button"
                  onClick={clearSelection}
                  className="rounded-full border border-[var(--border-subtle)] bg-[var(--surface-card)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-secondary"
                >
                  Clear
                </button>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <select
                  value={bulkEdit.categoryId}
                  onChange={(event) => setBulkEdit((current) => ({ ...current, categoryId: event.target.value }))}
                  className="rounded-[1rem] border border-[var(--border-subtle)] bg-[var(--surface-card)] px-3 py-2 text-sm text-[var(--foreground)]"
                >
                  <option value={BULK_NO_CHANGE} className="bg-[var(--panel-bg)] text-[var(--foreground)]">
                    Keep current category
                  </option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id} className="bg-[var(--panel-bg)] text-[var(--foreground)]">
                      Set category: {category.name}
                    </option>
                  ))}
                </select>

                <select
                  value={bulkEdit.brandId}
                  onChange={(event) => setBulkEdit((current) => ({ ...current, brandId: event.target.value }))}
                  className="rounded-[1rem] border border-[var(--border-subtle)] bg-[var(--surface-card)] px-3 py-2 text-sm text-[var(--foreground)]"
                >
                  <option value={BULK_NO_CHANGE} className="bg-[var(--panel-bg)] text-[var(--foreground)]">
                    Keep current brand
                  </option>
                  <option value={BULK_CLEAR_BRAND} className="bg-[var(--panel-bg)] text-[var(--foreground)]">
                    Clear brand
                  </option>
                  {availableBrands.map((brand) => (
                    <option key={brand.id} value={brand.id} className="bg-[var(--panel-bg)] text-[var(--foreground)]">
                      Set brand: {brand.name}
                    </option>
                  ))}
                </select>

                <select
                  value={bulkEdit.condition}
                  onChange={(event) => setBulkEdit((current) => ({ ...current, condition: event.target.value }))}
                  className="rounded-[1rem] border border-[var(--border-subtle)] bg-[var(--surface-card)] px-3 py-2 text-sm text-[var(--foreground)]"
                >
                  <option value={BULK_NO_CHANGE} className="bg-[var(--panel-bg)] text-[var(--foreground)]">
                    Keep current condition
                  </option>
                  {CONDITION_OPTIONS.map((option) => (
                    <option key={option} value={option} className="bg-[var(--panel-bg)] text-[var(--foreground)]">
                      Set condition: {formatCondition(option)}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  min="0"
                  value={bulkEdit.price}
                  onChange={(event) => setBulkEdit((current) => ({ ...current, price: event.target.value }))}
                  placeholder="Set price for selected (optional)"
                  className="rounded-[1rem] border border-[var(--border-subtle)] bg-[var(--surface-card)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--text-soft)]"
                />

                <input
                  type="number"
                  min="0"
                  value={bulkEdit.stock}
                  onChange={(event) => setBulkEdit((current) => ({ ...current, stock: event.target.value }))}
                  placeholder="Set stock for selected (optional)"
                  className="rounded-[1rem] border border-[var(--border-subtle)] bg-[var(--surface-card)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--text-soft)]"
                />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleBulkUpdate}
                  disabled={isPending}
                  className="rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--primary-contrast)] disabled:opacity-60"
                >
                  {isPending ? "Applying..." : "Apply updates"}
                </button>
                <button
                  type="button"
                  onClick={handleBulkDelete}
                  disabled={isPending}
                  className="rounded-full border border-[var(--status-error)]/25 bg-[var(--status-error)]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--status-error)] disabled:opacity-60"
                >
                  {isPending ? "Deleting..." : "Delete selected"}
                </button>
              </div>
            </section>
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
              <div className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-soft)]">Brand</span>
                <select
                  value={draft.brandId}
                  onChange={(event) => {
                    setDraft((current) => ({ ...current, brandId: event.target.value }));
                    setValidationErrors((current) => ({ ...current, brandId: undefined }));
                  }}
                  className="interactive-focus w-full rounded-[1rem] border border-[var(--border-subtle)] bg-[var(--surface-card)] px-4 py-3 text-sm text-[var(--foreground)] outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
                >
                  <option value="" className="bg-[var(--panel-bg)] text-[var(--foreground)]">
                    No brand
                  </option>
                  {availableBrands.map((brand) => (
                    <option key={brand.id} value={brand.id} className="bg-[var(--panel-bg)] text-[var(--foreground)]">
                      {brand.name}
                    </option>
                  ))}
                </select>
                {validationErrors.brandId ? (
                  <p className="mt-2 text-xs font-medium text-[var(--status-error)]">{validationErrors.brandId}</p>
                ) : null}
                <div className="mt-3 space-y-2 rounded-[1rem] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-soft)]">Quick add brand</p>
                  <input
                    value={newBrandName}
                    onChange={(event) => setNewBrandName(event.target.value)}
                    placeholder="Brand name"
                    className="interactive-focus w-full rounded-[0.85rem] border border-[var(--border-subtle)] bg-[var(--surface-soft)] px-3 py-2 text-xs text-[var(--foreground)] outline-none placeholder:text-[var(--text-soft)] focus-visible:ring-2 focus-visible:ring-primary/25"
                  />
                  <input
                    value={newBrandImage}
                    onChange={(event) => setNewBrandImage(event.target.value)}
                    placeholder="Image URL (optional)"
                    className="interactive-focus w-full rounded-[0.85rem] border border-[var(--border-subtle)] bg-[var(--surface-soft)] px-3 py-2 text-xs text-[var(--foreground)] outline-none placeholder:text-[var(--text-soft)] focus-visible:ring-2 focus-visible:ring-primary/25"
                  />
                  <button
                    type="button"
                    onClick={handleCreateBrand}
                    disabled={isPending}
                    className="rounded-full border border-[var(--border-subtle)] bg-[var(--surface-soft)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary transition-colors hover:text-[var(--foreground)] disabled:opacity-60"
                  >
                    Add brand
                  </button>
                </div>
              </div>
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


