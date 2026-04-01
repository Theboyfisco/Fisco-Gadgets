export function shouldUseDatabase() {
  return Boolean(process.env.DATABASE_URL) && process.env.npm_lifecycle_event !== "build";
}
