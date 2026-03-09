export function LoadingSkeleton() {
    return (
        <div className="relative w-full space-y-5 overflow-hidden rounded-standard bg-[var(--surface-card)] p-4">
            {/* Shimmer Effect */}
            <div className="absolute inset-0 z-10 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-[var(--surface-cta)] to-transparent" />

            {/* Skeleton Blocks */}
            <div className="h-48 w-full rounded-md bg-[var(--surface-cta)]" />
            <div className="space-y-3">
                <div className="h-6 w-3/4 rounded bg-[var(--surface-cta)]" />
                <div className="h-5 w-1/3 rounded bg-primary/20" />
            </div>
            <div className="flex gap-2 pt-2">
                <div className="h-4 w-1/4 rounded bg-[var(--surface-cta)]" />
                <div className="h-4 w-1/4 rounded bg-[var(--surface-cta)]" />
            </div>
        </div>
    );
}
