const BELGIAN_COUNTRY_CODE = '32';

/** Converts a local Belgian number to international digits, e.g. "0477191385" -> "32477191385". */
function toInternationalDigits(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return `${BELGIAN_COUNTRY_CODE}${digits.replace(/^0/, '')}`;
}

/** Formats a Belgian mobile number for display, e.g. "0477191385" -> "0477 19 13 85". */
export function formatBelgianPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits.replace(/^(\d{4})(\d{2})(\d{2})(\d{2})$/, '$1 $2 $3 $4');
}

/** Builds a `tel:` link in international format, e.g. "0477191385" -> "tel:+32477191385". */
export function toTelHref(phone: string): string {
  return `tel:+${toInternationalDigits(phone)}`;
}

/** Builds a WhatsApp chat link, e.g. "0477191385" -> "https://wa.me/32477191385". */
export function toWhatsAppHref(phone: string): string {
  return `https://wa.me/${toInternationalDigits(phone)}`;
}
