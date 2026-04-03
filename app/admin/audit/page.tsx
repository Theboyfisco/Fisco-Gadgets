import Link from "next/link";
import prisma from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";
import { shouldUseDatabase } from "@/lib/should-use-database";

export default async function AdminAuditPage() {
  await requireAdmin();

  if (!shouldUseDatabase()) {
    return (
      <div className="container mx-auto flex-1 px-4 py-10">
        <div className="rounded-[1.75rem] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 text-sm text-secondary">
          Audit logs are unavailable while database mode is disabled.
        </div>
      </div>
    );
  }

  const logs = await prisma.adminAuditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 120,
  });

  return (
    <div className="container mx-auto flex-1 px-4 py-10">
      <div className="mb-6 rounded-[2rem] border border-[var(--border-subtle)] bg-[linear-gradient(180deg,var(--surface-card-strong),var(--surface-card))] p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-soft)]">Admin security</p>
        <h1 className="mt-2 text-3xl font-bold text-[var(--foreground)]">Audit log</h1>
        <p className="mt-2 text-sm text-secondary">Trace admin changes to price, stock, specs, media, orders, and taxonomy.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/admin/products"
            className="rounded-full border border-[var(--interactive-border)] bg-[var(--surface-card)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-secondary transition-colors hover:text-[var(--foreground)]"
          >
            Products
          </Link>
          <Link
            href="/admin/catalog"
            className="rounded-full border border-[var(--interactive-border)] bg-[var(--surface-card)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-secondary transition-colors hover:text-[var(--foreground)]"
          >
            Catalog
          </Link>
          <Link
            href="/admin/promos"
            className="rounded-full border border-[var(--interactive-border)] bg-[var(--surface-card)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-secondary transition-colors hover:text-[var(--foreground)]"
          >
            Promos
          </Link>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="rounded-[1.5rem] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-6 text-sm text-secondary">No audit entries yet.</div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <article key={log.id} className="rounded-[1.25rem] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-4">
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
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
