const defaultWhatsAppNumber = "2347031606782";

function sanitizeWhatsAppNumber(input: string | undefined) {
  const normalized = (input ?? "").replace(/[^\d]/g, "");
  return normalized || defaultWhatsAppNumber;
}

export const SUPPORT_WHATSAPP_NUMBER = sanitizeWhatsAppNumber(process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP_NUMBER);
export const SUPPORT_WHATSAPP_DISPLAY =
  process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP_DISPLAY?.trim() || "+234 703 160 6782";
export const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || "support@noxtech.com.ng";
export const SUPPORT_SALES_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_SALES_EMAIL?.trim() || "sales@noxtech.com.ng";

export function buildWhatsAppLink(message: string) {
  return `https://wa.me/${SUPPORT_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

