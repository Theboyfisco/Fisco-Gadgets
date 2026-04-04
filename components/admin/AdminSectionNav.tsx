import Link from "next/link";

const ADMIN_LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/catalog", label: "Catalog" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/promos", label: "Promos" },
  { href: "/admin/audit", label: "Audit" },
];

export function AdminSectionNav({ activePath }: { activePath: string }) {
  return (
    <nav className="mb-6 flex flex-wrap gap-2 rounded-[1.25rem] border border-[var(--border-subtle)] bg-[var(--surface-card)] p-2 shadow-[0_10px_35px_rgba(var(--shadow-neutral-rgb),0.08)]">
      {ADMIN_LINKS.map((link) => {
        const isActive = activePath === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={[
              "rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition-all",
              isActive
                ? "border border-primary/60 bg-primary text-[var(--primary-contrast)] shadow-glow"
                : "border border-[var(--interactive-border)] bg-[var(--surface-soft)] text-secondary hover:-translate-y-0.5 hover:text-[var(--foreground)]",
            ].join(" ")}
          >
            {link.label}
          </Link>
        );
      })}
      <a
        href="/admin/logout"
        rel="nofollow"
        className="rounded-full border border-[var(--interactive-border)] bg-[var(--surface-soft)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-secondary transition-all hover:-translate-y-0.5 hover:text-[var(--foreground)]"
      >
        Logout
      </a>
    </nav>
  );
}
