/**
 * Shipping Service
 * Calculates shipping fees based on Nigerian geography.
 * Designed to be swappable with Terminal Africa/Logistics APIs.
 */

export const SHIPPING_RATES = {
  ASABA_FREE_ZONE: "Asaba",
  FLAT_RATE_NGN: 5000, // in Naira
};

export function calculateShippingFee(city: string): number {
  // Convert to Kobo for database storage (1 NGN = 100 Kobo)
  if (city.toLowerCase().trim() === SHIPPING_RATES.ASABA_FREE_ZONE.toLowerCase()) {
    return 0;
  }
  
  return SHIPPING_RATES.FLAT_RATE_NGN * 100;
}
