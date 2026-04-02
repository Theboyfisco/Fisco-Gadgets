/**
 * Shipping Service
 * Calculates shipping fees in NGN based on Nigerian geography.
 * Designed to be swappable with Terminal Africa/Logistics APIs.
 */

export const SHIPPING_RATES = {
  ASABA_FREE_ZONE: "Asaba",
  DEFAULT_NGN: 5000,
  LAGOS_NGN: 2000,
  ABUJA_NGN: 3000,
};

const FREE_CITIES = new Set(["asaba"]);
const PRIORITY_CITIES = new Map([
  ["lagos", SHIPPING_RATES.LAGOS_NGN],
  ["ikeja", SHIPPING_RATES.LAGOS_NGN],
  ["lekki", SHIPPING_RATES.LAGOS_NGN],
  ["victoria island", SHIPPING_RATES.LAGOS_NGN],
  ["abuja", SHIPPING_RATES.ABUJA_NGN],
  ["garki", SHIPPING_RATES.ABUJA_NGN],
  ["maitama", SHIPPING_RATES.ABUJA_NGN],
]);

const STATE_RATES = new Map([
  ["lagos", SHIPPING_RATES.LAGOS_NGN],
  ["abuja", SHIPPING_RATES.ABUJA_NGN],
  ["fct", SHIPPING_RATES.ABUJA_NGN],
  ["federal capital territory", SHIPPING_RATES.ABUJA_NGN],
]);

function normalize(input?: string) {
  return (input ?? "").trim().toLowerCase();
}

export function calculateShippingFee(city?: string, state?: string, shippingType: "LOCAL_PICKUP" | "DELIVERY" = "DELIVERY"): number {
  if (shippingType === "LOCAL_PICKUP") return 0;

  const normalizedCity = normalize(city);
  const normalizedState = normalize(state);

  if (normalizedCity && FREE_CITIES.has(normalizedCity)) {
    return 0;
  }

  if (normalizedCity && PRIORITY_CITIES.has(normalizedCity)) {
    return PRIORITY_CITIES.get(normalizedCity) ?? SHIPPING_RATES.DEFAULT_NGN;
  }

  if (normalizedState && STATE_RATES.has(normalizedState)) {
    return STATE_RATES.get(normalizedState) ?? SHIPPING_RATES.DEFAULT_NGN;
  }

  return SHIPPING_RATES.DEFAULT_NGN;
}
