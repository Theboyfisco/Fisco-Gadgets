import Link from "next/link";
import { ArrowRight, Boxes, ClipboardList, Database, GalleryVerticalEnd, ShieldAlert, TriangleAlert } from "lucide-react";
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

  const lowStockCount = products.filter((product) => product.stock <= 3).length;
  const unassignedBrandCount = products.filter((product) => !product.brandId).length;
  const lastUpdatedAt = products[0]?.updatedAt
    ? new Intl.DateTimeFormat("en-NG", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Africa/Lagos",
      }).format(products[0].updatedAt)
    : "No live edits yet";

  return (
    <div className="container mx-auto flex-1 px-4 py-10">
      <AdminSectionNav activePath="/admin/products" />

      <Reveal className="mb-8">
        <section className="relative overflow-hidden rounded-[2.6rem] border border-[var(--hero-border)] bg-[var(--hero-surface)] p-6 shadow-[var(--hero-shadow)] sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute inset-0 opacity-90">
            <div className="absolute -left-16 top-0 h-56 w-56 rounded-full bg-primary/16 blur-3xl" />
            <div className="absolute right-0 top-12 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" />
            <div className="absolute inset-x-0 bottom-0 h-px bg-white/10" />
          </div>
          <div className="relative grid gap-6 lg:grid-cols-[1.35fr_0.95fr]">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--interactive-border)] bg-[var(--surface-card)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--hero-foreground)]">
                <Boxes size={14} className="text-primary" />
                Merchandising studio
              </div>
              <h1 className="max-w-4xl text-4xl font-bold tracking-[-0.05em] text-[var(--hero-foreground)] sm:text-5xl lg:text-6xl">
                Shape the catalog like an editorial control room, not a plain admin table.
              </h1>
              <p className="mt-4 max-w-2xl text-sm text-[var(--hero-foreground-soft)] sm:text-base">
                Review catalog health, jump into the editor, and keep product metadata, media, pricing, and stock in one sharper workspace.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="#product-editor"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-[var(--primary-contrast)] shadow-glow transition-colors hover:bg-[var(--primary-hover)]"
                >
                  Open editor
                  <ArrowRight size={16} />
                </a>
                <Link
                  href="/admin/catalog"
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--interactive-border)] bg-[var(--surface-card)] px-4 py-2.5 text-sm font-semibold text-[var(--hero-foreground)] transition-colors hover:bg-[var(--interactive-hover)]"
                >
                  Taxonomy
                </Link>
                <Link
                  href="/admin/orders"
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--interactive-border)] bg-[var(--surface-card)] px-4 py-2.5 text-sm font-semibold text-[var(--hero-foreground)] transition-colors hover:bg-[var(--interactive-hover)]"
                >
                  Orders
                </Link>
                <Link
                  href="/admin/promos"
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--interactive-border)] bg-[var(--surface-card)] px-4 py-2.5 text-sm font-semibold text-[var(--hero-foreground)] transition-colors hover:bg-[var(--interactive-hover)]"
                >
                  Promos
                </Link>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-soft)]">Low stock</p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">{lowStockCount}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[2rem] border border-[var(--interactive-border)] bg-[linear-gradient(160deg,rgba(255,255,255,0.12),rgba(255,255,255,0.04))] p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/14 p-3 text-primary">
                    <GalleryVerticalEnd size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-soft)]">Studio pulse</p>
                    <p className="mt-1 text-xl font-semibold text-[var(--foreground)]">Catalog operations snapshot</p>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <div className="flex items-start justify-between gap-4 rounded-[1.25rem] border border-[var(--interactive-border)] bg-[var(--surface-card)] p-4">
                    <div>
                      <p className="text-sm font-semibold text-[var(--foreground)]">Latest catalog activity</p>
                      <p className="mt-1 text-xs text-secondary">Most recent product update in the live inventory.</p>
                    </div>
                    <p className="text-right text-sm font-semibold text-[var(--foreground)]">{lastUpdatedAt}</p>
                  </div>
                  <div className="flex items-start justify-between gap-4 rounded-[1.25rem] border border-[var(--interactive-border)] bg-[var(--surface-card)] p-4">
                    <div>
                      <p className="text-sm font-semibold text-[var(--foreground)]">Products without brand mapping</p>
                      <p className="mt-1 text-xs text-secondary">These products may need richer merchandising metadata.</p>
                    </div>
                    <p className="text-right text-2xl font-semibold text-[var(--foreground)]">{unassignedBrandCount}</p>
                  </div>
                  <div className="flex items-start justify-between gap-4 rounded-[1.25rem] border border-[var(--interactive-border)] bg-[var(--surface-card)] p-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-full bg-[var(--status-error)]/10 p-2 text-[var(--status-error)]">
                        <TriangleAlert size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[var(--foreground)]">Needs attention</p>
                        <p className="mt-1 text-xs text-secondary">Low-stock products should be reviewed before demand spikes.</p>
                      </div>
                    </div>
                    <p className="text-right text-2xl font-semibold text-[var(--foreground)]">{lowStockCount}</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <Link
                  href="/admin/audit"
                  className="rounded-[1.4rem] border border-[var(--interactive-border)] bg-[var(--surface-card)] p-4 transition-transform hover:-translate-y-1"
                >
                  <ClipboardList size={18} className="text-primary" />
                  <p className="mt-3 text-sm font-semibold text-[var(--foreground)]">Audit trail</p>
                  <p className="mt-1 text-xs text-secondary">Trace who changed what.</p>
                </Link>
                <Link
                  href="/admin/catalog"
                  className="rounded-[1.4rem] border border-[var(--interactive-border)] bg-[var(--surface-card)] p-4 transition-transform hover:-translate-y-1"
                >
                  <Boxes size={18} className="text-primary" />
                  <p className="mt-3 text-sm font-semibold text-[var(--foreground)]">Taxonomy</p>
                  <p className="mt-1 text-xs text-secondary">Keep brands and categories tidy.</p>
                </Link>
                <a
                  href="/admin/logout"
                  rel="nofollow"
                  className="rounded-[1.4rem] border border-[var(--interactive-border)] bg-[var(--surface-card)] p-4 transition-transform hover:-translate-y-1"
                >
                  <ArrowRight size={18} className="text-primary" />
                  <p className="mt-3 text-sm font-semibold text-[var(--foreground)]">Exit admin</p>
                  <p className="mt-1 text-xs text-secondary">Sign out without leaving this workflow.</p>
                </a>
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

