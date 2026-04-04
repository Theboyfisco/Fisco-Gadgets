import Link from "next/link";
import { Database, ShieldAlert, Sparkles } from "lucide-react";
import prisma from "@/lib/db";
import { Reveal } from "@/components/ui/Reveal";
import { ProductAdminConsole } from "@/components/admin/ProductAdminConsole";
import { AdminSectionNav } from "@/components/admin/AdminSectionNav";
import { shouldUseDatabase } from "@/lib/should-use-database";
import { normalizeTechnicalSpecs } from "@/lib/normalize-product";
import { requireAdmin } from "@/lib/admin-auth";

export default async function AdminProductsPage() {
  await requireAdmin();
  const databaseEnabled = shouldUseDatabase();

  if (!databaseEnabled) {
    return (
      <div className="container mx-auto flex-1 px-4 py-10">
        <AdminSectionNav activePath="/admin/products" />

        <Reveal>
          <div className="rounded-[2rem] border border-[var(--border-subtle)] bg-[linear-gradient(180deg,var(--surface-card-strong),var(--surface-card))] p-8 shadow-[0_24px_70px_rgba(var(--shadow-neutral-rgb),0.12)]">
            <div className="mb-5 inline-flex rounded-full border border-[var(--interactive-border)] bg-[var(--surface-soft)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-soft)]">
              Admin console
            </div>
            <h1 className="text-4xl font-bold tracking-[-0.03em] text-[var(--foreground)]">Product management is unavailable during build-only mode.</h1>
            <p className="mt-4 max-w-2xl text-sm text-secondary">
              This page needs a live database connection because it creates, edits, and deletes catalog data.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-soft)] px-4 py-2 text-sm text-[var(--foreground)]">
                <Database size={16} className="text-primary" />
                Set `DATABASE_URL`
              </div>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-card)] px-4 py-2 text-sm font-semibold text-secondary transition-colors hover:text-[var(--foreground)]"
              >
                Return home
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    );
  }

  const [categories, brands, products] = await Promise.all([
    prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.brand.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.product.findMany({
      include: { category: { select: { name: true } }, brand: { select: { name: true } } },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  return (
    <div className="container mx-auto flex-1 px-4 py-10">
      <AdminSectionNav activePath="/admin/products" />

      <Reveal className="mb-8">
        <section className="overflow-hidden rounded-[2.4rem] border border-[var(--hero-border)] bg-[var(--hero-surface)] p-6 shadow-[var(--hero-shadow)] sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute" />
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <div className="mb-4 inline-flex rounded-full border border-[var(--interactive-border)] bg-[var(--surface-card)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--hero-foreground)]">
                Internal admin
              </div>
              <h1 className="max-w-3xl text-4xl font-bold tracking-[-0.04em] text-[var(--hero-foreground)] sm:text-5xl">
                Manage the live catalog with the same polish as the storefront.
              </h1>
              <p className="mt-4 max-w-2xl text-sm text-[var(--hero-foreground-soft)] sm:text-base">
                Create new products, edit inventory, update media, and keep catalog data clean without leaving the app.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/admin/catalog"
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--interactive-border)] bg-[var(--surface-card)] px-4 py-2 text-sm font-semibold text-[var(--hero-foreground)] transition-colors hover:bg-[var(--interactive-hover)]"
                >
                  Manage taxonomy
                </Link>
                <Link
                  href="/admin/orders"
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--interactive-border)] bg-[var(--surface-card)] px-4 py-2 text-sm font-semibold text-[var(--hero-foreground)] transition-colors hover:bg-[var(--interactive-hover)]"
                >
                  View orders
                </Link>
                <Link
                  href="/admin/promos"
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--interactive-border)] bg-[var(--surface-card)] px-4 py-2 text-sm font-semibold text-[var(--hero-foreground)] transition-colors hover:bg-[var(--interactive-hover)]"
                >
                  Manage promos
                </Link>
                <Link
                  href="/admin/audit"
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--interactive-border)] bg-[var(--surface-card)] px-4 py-2 text-sm font-semibold text-[var(--hero-foreground)] transition-colors hover:bg-[var(--interactive-hover)]"
                >
                  View audit log
                </Link>
                <a
                  href="/admin/logout"
                  rel="nofollow"
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--interactive-border)] bg-[var(--surface-card)] px-4 py-2 text-sm font-semibold text-[var(--hero-foreground)] transition-colors hover:bg-[var(--interactive-hover)]"
                >
                  Log out
                </a>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-[1.5rem] border border-[var(--interactive-border)] bg-[var(--surface-card)] p-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-soft)]">Products</p>
                <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">{products.length}</p>
              </div>
              <div className="rounded-[1.5rem] border border-[var(--interactive-border)] bg-[var(--surface-card)] p-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-soft)]">Categories</p>
                <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">{categories.length}</p>
              </div>
              <div className="rounded-[1.5rem] border border-[var(--interactive-border)] bg-[var(--surface-card)] p-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-soft)]">Brands</p>
                <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">{brands.length}</p>
              </div>
              <div className="rounded-[1.5rem] border border-[var(--interactive-border)] bg-[var(--surface-card)] p-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-soft)]">Scope</p>
                <p className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-[var(--foreground)]">
                  <Sparkles size={14} className="text-primary" />
                  Full product CRUD
                </p>
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      {categories.length === 0 ? (
        <Reveal>
          <div className="rounded-[1.75rem] border border-[var(--border-subtle)] bg-[linear-gradient(180deg,var(--surface-card),var(--surface-soft))] p-8 text-center shadow-[0_18px_50px_rgba(var(--shadow-neutral-rgb),0.08)]">
            <div className="mx-auto mb-4 inline-flex rounded-full bg-[var(--status-error)]/10 p-3 text-[var(--status-error)]">
              <ShieldAlert size={22} />
            </div>
            <h2 className="text-2xl font-semibold text-[var(--foreground)]">Create at least one category first.</h2>
            <p className="mt-2 text-sm text-secondary">
              Products need a category relation before they can be created from the admin console.
            </p>
          </div>
        </Reveal>
      ) : (
        <ProductAdminConsole
          categories={categories}
          brands={brands}
          products={products.map((product) => ({
            id: product.id,
            name: product.name,
            slug: product.slug,
            description: product.description,
            price: product.price,
            stock: product.stock,
            condition: product.condition,
            categoryId: product.categoryId,
            categoryName: product.category.name,
            brandId: product.brandId ?? undefined,
            brandName: product.brand?.name ?? undefined,
            images: product.images,
            technicalSpecs: normalizeTechnicalSpecs(product.technicalSpecs),
            updatedAt: product.updatedAt.toISOString(),
          }))}
        />
      )}
    </div>
  );
}

