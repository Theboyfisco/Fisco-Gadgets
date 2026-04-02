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

export const PICKUP_DETAILS = {
  address: "12 Tech Avenue, G.R.A, Asaba, Delta State 320213, Nigeria",
  hours: "Mon - Sat, 8:00 AM - 6:00 PM",
  contact: "+234 (0) 800 000 0000",
  note: "Bring your order ID and a valid phone number used during checkout.",
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

const CITY_ETA_DAYS = new Map<string, { min: number; max: number }>([
  ["asaba", { min: 0, max: 1 }],
  ["lagos", { min: 1, max: 2 }],
  ["ikeja", { min: 1, max: 2 }],
  ["lekki", { min: 1, max: 2 }],
  ["victoria island", { min: 1, max: 2 }],
  ["abuja", { min: 2, max: 3 }],
  ["garki", { min: 2, max: 3 }],
  ["maitama", { min: 2, max: 3 }],
]);

const DEFAULT_DELIVERY_ETA = { min: 3, max: 5 };

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

export function estimateDeliveryWindow(city?: string, state?: string, shippingType: "LOCAL_PICKUP" | "DELIVERY" = "DELIVERY") {
  if (shippingType === "LOCAL_PICKUP") {
    return {
      label: "Pickup ready same day (typically within 2-4 hours after payment)",
      minDays: 0,
      maxDays: 1,
    };
  }

  const normalizedCity = normalize(city);
  if (normalizedCity && CITY_ETA_DAYS.has(normalizedCity)) {
    const days = CITY_ETA_DAYS.get(normalizedCity)!;
    return {
      label: `${days.min}-${days.max} business days`,
      minDays: days.min,
      maxDays: days.max,
    };
  }

  const normalizedState = normalize(state);
  if (normalizedState === "lagos") {
    return { label: "1-2 business days", minDays: 1, maxDays: 2 };
  }
  if (normalizedState === "abuja" || normalizedState === "fct" || normalizedState === "federal capital territory") {
    return { label: "2-3 business days", minDays: 2, maxDays: 3 };
  }

  return {
    label: `${DEFAULT_DELIVERY_ETA.min}-${DEFAULT_DELIVERY_ETA.max} business days`,
    minDays: DEFAULT_DELIVERY_ETA.min,
    maxDays: DEFAULT_DELIVERY_ETA.max,
  };
}
