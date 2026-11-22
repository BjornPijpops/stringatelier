const BELGIAN_COUNTRY_CODE = '+32';

/** Formats a Belgian mobile number for display, e.g. "0477191385" -> "0477 19 13 85". */
export function formatBelgianPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits.replace(/^(\d{4})(\d{2})(\d{2})(\d{2})$/, '$1 $2 $3 $4');
}

/** Builds a `tel:` link in international format, e.g. "0477191385" -> "tel:+32477191385". */
export function toTelHref(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return `tel:${BELGIAN_COUNTRY_CODE}${digits.replace(/^0/, '')}`;
}
