export function shouldUseDatabase() {
  const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);
  if (!hasDatabaseUrl) return false;

  const forceFallbackFlag = process.env.NOXTECH_FORCE_FALLBACK_DATA ?? "";
  const forceFallback = ["1", "true", "yes"].includes(forceFallbackFlag.toLowerCase());
  if (forceFallback) return false;

  const buildPhase = process.env.NEXT_PHASE === "phase-production-build";
  const allowBuildDbFlag = process.env.NOXTECH_ENABLE_DB_DURING_BUILD ?? "";
  const allowDbDuringBuild = ["1", "true", "yes"].includes(allowBuildDbFlag.toLowerCase());

  if (buildPhase && !allowDbDuringBuild) {
    return false;
  }

  return true;
}
