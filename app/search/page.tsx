import type { Metadata } from "next";
import Link from "next/link";
import { searchProductsPaginated } from "@/actions/product";
import { ProductGridMotion } from "@/components/ui/ProductGridMotion";
import { getPrimaryImage, normalizeTechnicalSpecs } from "@/lib/normalize-product";
import { SITE_NAME, truncateDescription } from "@/lib/site-config";

export const revalidate = 180;

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; page?: string }>;
}): Promise<Metadata> {
  const resolved = searchParams ? await searchParams : undefined;
  const q = (resolved?.q || "").trim();
  const title = q ? `Search results for "${q}"` : "Search";
  return {
    title,
    description: truncateDescription(q ? `Browse search results for ${q} on ${SITE_NAME}.` : `Search products on ${SITE_NAME}.`),
    alternates: {
      canonical: q ? `/search?q=${encodeURIComponent(q)}` : "/search",
    },
  };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; page?: string }>;
}) {
  const resolved = searchParams ? await searchParams : undefined;
  const q = (resolved?.q || "").trim();
  const requestedPage = Number(resolved?.page || "1");
  const page = Number.isFinite(requestedPage) && requestedPage > 0 ? Math.floor(requestedPage) : 1;
  const pageSize = 24;

  const result = q.length >= 2 ? await searchProductsPaginated(q, page, pageSize) : { total: 0, page, pageSize, items: [] as any[] };
  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize));
  const safePage = Math.min(result.page, totalPages);
  const products = result.items.map((item: any) => ({
    id: item.id,
    name: item.name,
    slug: item.slug,
    price: item.price,
    stock: item.stock,
    image: getPrimaryImage(item.images),
    categoryId: item.categoryId,
    brandId: item.brandId ?? undefined,
    technicalSpecs: normalizeTechnicalSpecs(item.technicalSpecs),
  }));

  return (
    <div className="container mx-auto flex-1 px-4 py-10">
      <section className="mb-6 rounded-[1.75rem] border border-[var(--border-subtle)] bg-[linear-gradient(180deg,var(--surface-card),var(--surface-soft))] p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-soft)]">Search</p>
        <h1 className="mt-2 text-3xl font-bold text-[var(--foreground)]">
          {q ? (
            <>
              Results for &quot;{q}&quot;
            </>
          ) : (
            "Search the catalog"
          )}
        </h1>
        <p className="mt-2 text-sm text-secondary">
          {q.length < 2 ? "Type at least 2 characters in the search overlay to query products." : `${result.total} products found.`}
        </p>
      </section>

      {q.length < 2 ? (
        <div className="rounded-[1.5rem] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 text-sm text-secondary">
          Use the top search overlay, then choose &quot;Open&quot; or visit this page with `?q=...`.
        </div>
      ) : products.length === 0 ? (
        <div className="rounded-[1.5rem] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 text-sm text-secondary">No matching products found.</div>
      ) : (
        <>
          <ProductGridMotion products={products} />
          {totalPages > 1 ? (
            <div className="mt-8 flex items-center justify-between rounded-[1.25rem] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-soft)]">
                Page {safePage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Link
                  href={`/search?${new URLSearchParams({ q, page: String(Math.max(1, safePage - 1)) }).toString()}`}
                  aria-disabled={safePage <= 1}
                  className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] ${
                    safePage <= 1
                      ? "pointer-events-none border-[var(--border-subtle)] text-[var(--text-soft)]"
                      : "border-[var(--border-subtle)] text-secondary hover:text-[var(--foreground)]"
                  }`}
                >
                  Previous
                </Link>
                <Link
                  href={`/search?${new URLSearchParams({ q, page: String(Math.min(totalPages, safePage + 1)) }).toString()}`}
                  aria-disabled={safePage >= totalPages}
                  className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] ${
                    safePage >= totalPages
                      ? "pointer-events-none border-[var(--border-subtle)] text-[var(--text-soft)]"
                      : "border-[var(--border-subtle)] text-secondary hover:text-[var(--foreground)]"
                  }`}
                >
                  Next
                </Link>
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
