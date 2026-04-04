export default function GlobalLoading() {
  return (
    <div className="container mx-auto flex min-h-[48vh] items-center justify-center px-4 py-10">
      <div className="flex items-center gap-3 rounded-full border border-[var(--border-subtle)] bg-[var(--surface-card)] px-5 py-3 text-sm font-semibold text-secondary">
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-primary" />
        Loading page...
      </div>
    </div>
  );
}

