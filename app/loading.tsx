export default function RootLoading() {
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="animate-pulse space-y-4">
        <div className="h-10 w-48 rounded-xl bg-[var(--surface-soft)]" />
        <div className="h-48 rounded-2xl bg-[var(--surface-soft)]" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="h-56 rounded-2xl bg-[var(--surface-soft)]" />
          <div className="h-56 rounded-2xl bg-[var(--surface-soft)]" />
          <div className="h-56 rounded-2xl bg-[var(--surface-soft)]" />
        </div>
      </div>
    </div>
  );
}
