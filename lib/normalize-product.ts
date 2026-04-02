type TechnicalSpecs = Record<string, string | number | boolean | undefined>;

export const DEFAULT_PRODUCT_IMAGE = "/hero-brand-scene.svg";

export function normalizeTechnicalSpecs(input: unknown): TechnicalSpecs {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return {};
  }

  return input as TechnicalSpecs;
}

export function getPrimaryImage(images: unknown, fallback = ""): string {
  const safeFallback = fallback || DEFAULT_PRODUCT_IMAGE;

  if (!Array.isArray(images)) {
    return safeFallback;
  }

  const firstImage = images.find((image): image is string => typeof image === "string" && image.trim().length > 0);
  return firstImage ?? safeFallback;
}
