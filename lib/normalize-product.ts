type TechnicalSpecs = Record<string, string | number | boolean | undefined>;

export function normalizeTechnicalSpecs(input: unknown): TechnicalSpecs {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return {};
  }

  return input as TechnicalSpecs;
}

export function getPrimaryImage(images: unknown, fallback = ""): string {
  if (!Array.isArray(images)) {
    return fallback;
  }

  const firstImage = images.find((image): image is string => typeof image === "string" && image.trim().length > 0);
  return firstImage ?? fallback;
}
