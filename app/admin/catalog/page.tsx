import Link from "next/link";
import prisma from "@/lib/db";
import { Reveal } from "@/components/ui/Reveal";
import { requireAdmin } from "@/lib/admin-auth";
import { shouldUseDatabase } from "@/lib/should-use-database";
import { CatalogTaxonomyConsole } from "@/components/admin/CatalogTaxonomyConsole";

export default async function AdminCatalogPage() {
  await requireAdmin();

  if (!shouldUseDatabase()) {
    return (
      <div className="container mx-auto flex-1 px-4 py-10">
        <Reveal>
          <div className="rounded-[2rem] border border-[var(--border-subtle)] bg-[linear-gradient(180deg,var(--surface-card-strong),var(--surface-card))] p-8 shadow-[0_24px_70px_rgba(8,18,38,0.12)]">
            <h1 className="text-4xl font-bold tracking-[-0.03em] text-[var(--foreground)]">Catalog taxonomy is unavailable in build-only mode.</h1>
            <p className="mt-4 max-w-2xl text-sm text-secondary">Set a live `DATABASE_URL` to manage categories and brands.</p>
          </div>
        </Reveal>
      </div>
    );
  }

  const [categories, brands] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="container mx-auto flex-1 px-4 py-10">
      <Reveal className="mb-8">
        <section className="overflow-hidden rounded-[2.4rem] border border-[var(--hero-border)] bg-[var(--hero-surface)] p-6 shadow-[var(--hero-shadow)] sm:p-8 lg:p-10">
          <h1 className="max-w-3xl text-4xl font-bold tracking-[-0.04em] text-[var(--hero-foreground)] sm:text-5xl">
            Manage category and brand taxonomy.
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-[var(--hero-foreground-soft)] sm:text-base">
            Create, edit, and remove categories and brands so product organization scales with your catalog.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/admin/products"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--interactive-border)] bg-[var(--surface-card)] px-4 py-2 text-sm font-semibold text-[var(--hero-foreground)] transition-colors hover:bg-[var(--interactive-hover)]"
            >
              Product console
            </Link>
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--interactive-border)] bg-[var(--surface-card)] px-4 py-2 text-sm font-semibold text-[var(--hero-foreground)] transition-colors hover:bg-[var(--interactive-hover)]"
            >
              Order console
            </Link>
            <Link
              href="/admin/promos"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--interactive-border)] bg-[var(--surface-card)] px-4 py-2 text-sm font-semibold text-[var(--hero-foreground)] transition-colors hover:bg-[var(--interactive-hover)]"
            >
              Promo console
            </Link>
            <Link
              href="/admin/audit"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--interactive-border)] bg-[var(--surface-card)] px-4 py-2 text-sm font-semibold text-[var(--hero-foreground)] transition-colors hover:bg-[var(--interactive-hover)]"
            >
              Audit log
            </Link>
          </div>
        </section>
      </Reveal>

      <CatalogTaxonomyConsole
        categories={categories.map((item) => ({
          id: item.id,
          name: item.name,
          slug: item.slug,
          image: item.image,
        }))}
        brands={brands.map((item) => ({
          id: item.id,
          name: item.name,
          slug: item.slug,
          image: item.image,
        }))}
      />
    </div>
  );
}
