export function shouldUseDatabase() {
  const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);
  if (!hasDatabaseUrl) return false;

  const forceFallback = ["1", "true", "yes"].includes((process.env.FISCO_FORCE_FALLBACK_DATA || "").toLowerCase());
  if (forceFallback) return false;

  const buildPhase = process.env.NEXT_PHASE === "phase-production-build";
  const allowDbDuringBuild = ["1", "true", "yes"].includes((process.env.FISCO_ENABLE_DB_DURING_BUILD || "").toLowerCase());

  if (buildPhase && !allowDbDuringBuild) {
    return false;
  }

  return true;
}
