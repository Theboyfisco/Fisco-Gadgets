export function LoadingSkeleton() {
    return (
        <div className="w-full space-y-5 rounded-standard bg-white/5 p-4 relative overflow-hidden">
            {/* Shimmer Effect */}
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent z-10" />

            {/* Skeleton Blocks */}
            <div className="h-48 w-full rounded-md bg-zinc-800" />
            <div className="space-y-3">
                <div className="h-6 w-3/4 rounded bg-zinc-800" />
                <div className="h-5 w-1/3 rounded bg-emerald-900/40" />
            </div>
            <div className="flex gap-2 pt-2">
                <div className="h-4 w-1/4 rounded bg-zinc-800" />
                <div className="h-4 w-1/4 rounded bg-zinc-800" />
            </div>
        </div>
    );
}
