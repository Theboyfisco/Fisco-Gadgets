import Link from "next/link";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { shouldUseDatabase } from "@/lib/should-use-database";
import { AdminSectionNav } from "@/components/admin/AdminSectionNav";

type AdminAuditSearchParams = {
  q?: string;
  entity?: string;
  page?: string;
};

const PAGE_SIZE = 25;
const DEFAULT_ENTITY_OPTIONS = ["product", "order", "category", "brand", "promo", "media"];

function parsePage(value?: string) {
  const parsed = Number(value || "1");
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return Math.floor(parsed);
}

function buildAuditWhere(query: string): Prisma.AdminAuditLogWhereInput {
  if (!query) return {};
  return {
    OR: [
      { actor: { contains: query, mode: "insensitive" } },
      { action: { contains: query, mode: "insensitive" } },
      { entityType: { contains: query, mode: "insensitive" } },
      { entityId: { contains: query, mode: "insensitive" } },
    ],
  };
}

function buildAuditPageHref(page: number, query: string, entityFilter: string) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (entityFilter !== "ALL") params.set("entity", entityFilter);
  params.set("page", String(page));
  return `/admin/audit?${params.toString()}`;
}

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams?: Promise<AdminAuditSearchParams>;
}) {
  await requireAdmin();
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  if (!shouldUseDatabase()) {
    return (
      <div className="container mx-auto flex-1 px-4 py-10">
        <AdminSectionNav activePath="/admin/audit" />
        <div className="rounded-[1.75rem] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 text-sm text-secondary">
          Audit logs are unavailable while database mode is disabled.
        </div>
      </div>
    );
  }

  const query = (resolvedSearchParams?.q || "").trim();
  const entityFilterRaw = (resolvedSearchParams?.entity || "ALL").trim();
  const entityFilter = entityFilterRaw ? entityFilterRaw : "ALL";
  const requestedPage = parsePage(resolvedSearchParams?.page);

  const baseWhere = buildAuditWhere(query);
  const filteredWhere: Prisma.AdminAuditLogWhereInput = {
    ...baseWhere,
    ...(entityFilter !== "ALL" ? { entityType: entityFilter } : {}),
  };

  const [totalFiltered, distributionRows] = await Promise.all([
    prisma.adminAuditLog.count({ where: filteredWhere }),
    prisma.adminAuditLog.groupBy({
      by: ["entityType"],
      where: baseWhere,
      _count: { _all: true },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE));
  const safePage = Math.min(requestedPage, totalPages);
  const skip = (safePage - 1) * PAGE_SIZE;

  const logs = await prisma.adminAuditLog.findMany({
    where: filteredWhere,
    orderBy: { createdAt: "desc" },
    take: PAGE_SIZE,
    skip,
  });

  const distribution = distributionRows
    .map((row) => ({ entityType: row.entityType, count: row._count._all }))
    .sort((left, right) => right.count - left.count);
  const entityOptions = Array.from(new Set([...DEFAULT_ENTITY_OPTIONS, ...distribution.map((entry) => entry.entityType)])).sort();
  const hasActiveFilter = query.length > 0 || entityFilter !== "ALL";
  const pageLinks = Array.from(
    new Set([1, safePage - 1, safePage, safePage + 1, totalPages].filter((value) => value >= 1 && value <= totalPages)),
  ).sort((left, right) => left - right);

  return (
    <div className="container mx-auto flex-1 px-4 py-10">
      <AdminSectionNav activePath="/admin/audit" />

      <div className="mb-6 rounded-[2rem] border border-[var(--border-subtle)] bg-[linear-gradient(180deg,var(--surface-card-strong),var(--surface-card))] p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-soft)]">Admin security</p>
        <h1 className="mt-2 text-3xl font-bold text-[var(--foreground)]">Audit log</h1>
        <p className="mt-2 text-sm text-secondary">Trace admin changes to products, media, orders, promos, and taxonomy with server-side filtering.</p>

        <form method="get" className="mt-5 grid gap-3 rounded-[1.2rem] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 md:grid-cols-[1fr_auto_auto_auto] md:items-center">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search by actor, action, entity type, or entity ID..."
            className="interactive-focus w-full rounded-full border border-[var(--border-subtle)] bg-[var(--surface-soft)] px-4 py-2 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--text-soft)] focus-visible:ring-2 focus-visible:ring-primary/25"
          />
          <select
            name="entity"
            defaultValue={entityFilter}
            className="rounded-full border border-[var(--border-subtle)] bg-[var(--surface-soft)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--foreground)] outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
          >
            <option value="ALL">All entities</option>
            {entityOptions.map((entityType) => (
              <option key={entityType} value={entityType}>
                {entityType}
              </option>
            ))}
          </select>
          <input type="hidden" name="page" value="1" />
          <button
            type="submit"
            className="rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--primary-contrast)]"
          >
            Apply filters
          </button>
          {hasActiveFilter ? (
            <Link
              href="/admin/audit"
              className="rounded-full border border-[var(--interactive-border)] bg-[var(--surface-soft)] px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.18em] text-[var(--foreground)] md:col-start-4"
            >
              Clear filters
            </Link>
          ) : null}
        </form>
      </div>

      <section className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-[1.25rem] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-soft)]">Matching entries</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">{totalFiltered}</p>
        </div>
        {distribution.slice(0, 3).map((entry) => (
          <div key={entry.entityType} className="rounded-[1.25rem] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-soft)]">{entry.entityType}</p>
            <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">{entry.count}</p>
          </div>
        ))}
      </section>

      {logs.length === 0 ? (
        <div className="rounded-[1.5rem] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 text-sm text-secondary">
          No audit entries match the current filters.
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <article key={log.id} className="rounded-[1.25rem] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4 shadow-[0_10px_35px_rgba(var(--shadow-neutral-rgb),0.08)]">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-soft)]">{log.entityType}</p>
                  <p className="mt-1 text-sm font-semibold text-[var(--foreground)]">{log.action}</p>
                  <p className="mt-1 text-xs text-secondary">
                    Actor: {log.actor} {log.entityId ? `• Entity: ${log.entityId}` : ""}
                  </p>
                </div>
                <p className="text-xs text-secondary">{new Date(log.createdAt).toLocaleString("en-NG")}</p>
              </div>
              {(log.before || log.after) ? (
                <details className="mt-3 rounded-[0.8rem] border border-[var(--interactive-border)] bg-[var(--surface-soft)] p-3">
                  <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-soft)]">
                    View payload changes
                  </summary>
                  <div className="mt-2 grid gap-2 lg:grid-cols-2">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--text-soft)]">Before</p>
                      <pre className="mt-1 max-h-40 overflow-auto rounded-md border border-[var(--border-subtle)] bg-[var(--surface-card)] p-2 text-[11px] text-secondary">
                        {log.before ? JSON.stringify(log.before, null, 2) : "null"}
                      </pre>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--text-soft)]">After</p>
                      <pre className="mt-1 max-h-40 overflow-auto rounded-md border border-[var(--border-subtle)] bg-[var(--surface-card)] p-2 text-[11px] text-secondary">
                        {log.after ? JSON.stringify(log.after, null, 2) : "null"}
                      </pre>
                    </div>
                  </div>
                </details>
              ) : null}
            </article>
          ))}
        </div>
      )}

      {totalPages > 1 ? (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-soft)]">
            Page {safePage} of {totalPages}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={buildAuditPageHref(Math.max(1, safePage - 1), query, entityFilter)}
              aria-disabled={safePage <= 1}
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] ${
                safePage <= 1
                  ? "pointer-events-none border-[var(--border-subtle)] text-[var(--text-soft)]"
                  : "border-[var(--border-subtle)] text-secondary hover:text-[var(--foreground)]"
              }`}
            >
              Previous
            </Link>
            {pageLinks.map((pageLink) => (
              <Link
                key={pageLink}
                href={buildAuditPageHref(pageLink, query, entityFilter)}
                className={`rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] ${
                  pageLink === safePage
                    ? "border-primary bg-primary text-[var(--primary-contrast)]"
                    : "border-[var(--border-subtle)] text-secondary hover:text-[var(--foreground)]"
                }`}
              >
                {pageLink}
              </Link>
            ))}
            <Link
              href={buildAuditPageHref(Math.min(totalPages, safePage + 1), query, entityFilter)}
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
    </div>
  );
}
